/**
 * Simple, self-contained client-side EXIF GPS reader for JPEG images.
 * Extracts Latitude, Longitude, and GPS Timestamp if present in APP1 Exif marker.
 */

export async function readExifGps(fileOrArrayBuffer) {
  try {
    let arrayBuffer;
    if (fileOrArrayBuffer instanceof ArrayBuffer) {
      arrayBuffer = fileOrArrayBuffer;
    } else if (fileOrArrayBuffer instanceof Blob || fileOrArrayBuffer instanceof File) {
      // Read first 128KB of file (EXIF headers are at the very beginning)
      const slice = fileOrArrayBuffer.slice(0, 131072);
      arrayBuffer = await slice.arrayBuffer();
    } else {
      return { hasGps: false };
    }

    const dataView = new DataView(arrayBuffer);

    // Verify JPEG SOI marker (0xFFD8)
    if (dataView.byteLength < 4 || dataView.getUint16(0) !== 0xFFD8) {
      return { hasGps: false };
    }

    let offset = 2;
    let exifOffset = -1;

    // Scan for APP1 marker (0xFFE1)
    while (offset + 4 < dataView.byteLength) {
      const marker = dataView.getUint16(offset);
      const length = dataView.getUint16(offset + 2);

      if (marker === 0xFFE1) {
        // Check for 'Exif\0\0' (0x45786966 0x0000)
        if (dataView.getUint32(offset + 4) === 0x45786966 && dataView.getUint16(offset + 8) === 0x0000) {
          exifOffset = offset + 10;
          break;
        }
      }

      if ((marker & 0xFF00) !== 0xFF00 || marker === 0xFFDA || marker === 0xFFD9) {
        // Stop scanning at Start of Scan (SOS) or End of Image (EOI)
        break;
      }

      offset += 2 + length;
    }

    if (exifOffset === -1 || exifOffset + 8 >= dataView.byteLength) {
      return { hasGps: false };
    }

    // TIFF Header: Byte align (II = 0x4949 = Little Endian, MM = 0x4D4D = Big Endian)
    const byteOrderMarker = dataView.getUint16(exifOffset);
    const littleEndian = byteOrderMarker === 0x4949;
    if (!littleEndian && byteOrderMarker !== 0x4D4D) {
      return { hasGps: false };
    }

    // Verify 42 (0x002A) in TIFF header
    if (dataView.getUint16(exifOffset + 2, littleEndian) !== 0x002A) {
      return { hasGps: false };
    }

    const firstIfdOffset = dataView.getUint32(exifOffset + 4, littleEndian);
    if (firstIfdOffset < 8 || exifOffset + firstIfdOffset >= dataView.byteLength) {
      return { hasGps: false };
    }

    // Parse 0th IFD to find GPS IFD Pointer (Tag 0x8825)
    let ifdOffset = exifOffset + firstIfdOffset;
    if (ifdOffset + 2 >= dataView.byteLength) return { hasGps: false };
    
    const numEntries = dataView.getUint16(ifdOffset, littleEndian);
    let gpsIfdOffset = -1;

    for (let i = 0; i < numEntries; i++) {
      const entryOffset = ifdOffset + 2 + i * 12;
      if (entryOffset + 12 > dataView.byteLength) break;

      const tag = dataView.getUint16(entryOffset, littleEndian);
      if (tag === 0x8825) { // GPS Info IFD Pointer
        const pointer = dataView.getUint32(entryOffset + 8, littleEndian);
        gpsIfdOffset = exifOffset + pointer;
        break;
      }
    }

    if (gpsIfdOffset === -1 || gpsIfdOffset + 2 >= dataView.byteLength) {
      return { hasGps: false };
    }

    // Parse GPS IFD
    const numGpsEntries = dataView.getUint16(gpsIfdOffset, littleEndian);
    let latRef = 'N';
    let lngRef = 'E';
    let latValues = null;
    let lngValues = null;
    let gpsDateStamp = null;

    for (let j = 0; j < numGpsEntries; j++) {
      const entryOffset = gpsIfdOffset + 2 + j * 12;
      if (entryOffset + 12 > dataView.byteLength) break;

      const tag = dataView.getUint16(entryOffset, littleEndian);
      const valOffset = dataView.getUint32(entryOffset + 8, littleEndian);

      if (tag === 0x0001) { // GPSLatitudeRef
        latRef = String.fromCharCode(dataView.getUint8(entryOffset + 8));
      } else if (tag === 0x0002) { // GPSLatitude (3 rationals)
        latValues = readRationalArray(dataView, exifOffset + valOffset, 3, littleEndian);
      } else if (tag === 0x0003) { // GPSLongitudeRef
        lngRef = String.fromCharCode(dataView.getUint8(entryOffset + 8));
      } else if (tag === 0x0004) { // GPSLongitude (3 rationals)
        lngValues = readRationalArray(dataView, exifOffset + valOffset, 3, littleEndian);
      } else if (tag === 0x001D) { // GPSDateStamp
        gpsDateStamp = readString(dataView, exifOffset + valOffset, 11);
      }
    }

    if (latValues && lngValues && latValues.length === 3 && lngValues.length === 3) {
      let lat = latValues[0] + latValues[1] / 60 + latValues[2] / 3600;
      if (latRef === 'S') lat = -lat;

      let lng = lngValues[0] + lngValues[1] / 60 + lngValues[2] / 3600;
      if (lngRef === 'W') lng = -lng;

      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return {
          hasGps: true,
          latitude: parseFloat(lat.toFixed(6)),
          longitude: parseFloat(lng.toFixed(6)),
          capturedAt: gpsDateStamp ? `${gpsDateStamp.replace(/:/g, '-')}T12:00:00.000Z` : new Date().toISOString()
        };
      }
    }

    return { hasGps: false };
  } catch (err) {
    console.warn('EXIF parsing notice:', err.message);
    return { hasGps: false };
  }
}

function readRationalArray(dataView, offset, count, littleEndian) {
  if (offset + count * 8 > dataView.byteLength) return null;
  const result = [];
  for (let i = 0; i < count; i++) {
    const num = dataView.getUint32(offset + i * 8, littleEndian);
    const den = dataView.getUint32(offset + i * 8 + 4, littleEndian);
    if (den === 0) return null;
    result.push(num / den);
  }
  return result;
}

function readString(dataView, offset, length) {
  if (offset + length > dataView.byteLength) return null;
  let str = '';
  for (let i = 0; i < length; i++) {
    const charCode = dataView.getUint8(offset + i);
    if (charCode === 0) break;
    str += String.fromCharCode(charCode);
  }
  return str.trim();
}
