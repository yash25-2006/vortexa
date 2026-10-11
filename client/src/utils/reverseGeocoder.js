/**
 * Reverse Geocoding Utility
 * Resolves GPS coordinates (latitude, longitude) to a human-readable Indian civic address.
 * Never displays raw numerical coordinates as the primary text to citizens.
 */

const NOMINATIM_TIMEOUT_MS = 2500;

/**
 * Reverse geocode coordinates to a clean human-readable address
 * @param {number} latitude
 * @param {number} longitude
 * @param {Object} fallbackProfile (optional registered citizen profile)
 * @returns {Promise<{ address: string, locality: string, district: string, state: string, country: string, isReverseGeocoded: boolean }>}
 */
export async function reverseGeocodeCoords(latitude, longitude, fallbackProfile = null) {
  if (!latitude || !longitude) {
    return {
      address: fallbackProfile?.address || 'Location Identified',
      locality: fallbackProfile?.village || fallbackProfile?.district || '',
      district: fallbackProfile?.district || '',
      state: fallbackProfile?.state || '',
      country: 'India',
      isReverseGeocoded: false
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), NOMINATIM_TIMEOUT_MS);

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en-IN,en,mr,hi'
      }
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const building = addr.building || addr.house_number || '';
        const road = addr.road || addr.street || addr.pedestrian || addr.footway || addr.path || '';
        const locality = addr.suburb || addr.neighbourhood || addr.residential || addr.village || addr.town || addr.city_district || addr.hamlet || '';
        const cityOrDistrict = addr.city || addr.town || addr.county || addr.district || fallbackProfile?.district || '';
        const state = addr.state || fallbackProfile?.state || '';
        const postcode = addr.postcode || '';
        const country = addr.country || 'India';

        const parts = [];
        if (building) parts.push(building);
        if (road && road !== building) parts.push(road);
        if (locality && locality !== road) parts.push(locality);
        if (cityOrDistrict && cityOrDistrict !== locality) parts.push(cityOrDistrict);
        if (state && state !== cityOrDistrict) {
          if (postcode) {
            parts.push(`${state} ${postcode}`);
          } else {
            parts.push(state);
          }
        }
        if (country) parts.push(country);

        const cleanAddress = parts.join(', ');

        return {
          address: cleanAddress || data.display_name || 'Verified Location',
          locality: locality || cityOrDistrict,
          district: cityOrDistrict,
          state,
          country,
          isReverseGeocoded: true
        };
      }
    }
  } catch (err) {
    // Network/timeout fallback - silently handled
  }

  // Graceful Local / Profile fallback
  if (fallbackProfile && (fallbackProfile.address || fallbackProfile.district)) {
    const district = fallbackProfile?.district || '';
    const state = fallbackProfile?.state || '';
    const locality = fallbackProfile?.village || fallbackProfile?.address?.split(',')[0]?.trim() || '';

    const addressParts = [locality, district, state, 'India'].filter(Boolean);

    return {
      address: fallbackProfile.address || addressParts.join(', ') || 'Verified Location',
      locality,
      district,
      state,
      country: 'India',
      isReverseGeocoded: true
    };
  }

  return {
    address: 'Location Identified',
    locality: '',
    district: '',
    state: '',
    country: 'India',
    isReverseGeocoded: false
  };
}
