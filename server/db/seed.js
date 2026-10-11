const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('./index');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Load raw data from dedicated JSON files in server/data/demo/
 */
function loadDemoJson(filename, fallbackData = []) {
  try {
    const filePath = path.join(__dirname, '..', 'data', 'demo', filename);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`[Seed Warning] Could not read ${filename}, using fallback:`, err.message);
  }
  return fallbackData;
}

async function seed() {
  console.log('===============================================================');
  console.log(' Seeding India Development Intelligence Platform Demo Dataset');
  console.log('===============================================================');
  await db.initDb();

  // 1. Seed Administrative Regions (24 Regions from JSON)
  const regionsToSeed = loadDemoJson('administrative_regions.json', []);
  const regionMap = {};
  for (const reg of regionsToSeed) {
    const createdReg = await db.upsertAdministrativeRegion(reg);
    if (createdReg) {
      if (createdReg.name) regionMap[createdReg.name] = createdReg;
      if (createdReg.ward) regionMap[createdReg.ward] = createdReg;
      if (createdReg.locality) regionMap[createdReg.locality] = createdReg;
      regionMap[createdReg.id] = createdReg;
    }
  }
  console.log(`[OK] Administrative Regions seeded: ${regionsToSeed.length} entries.`);

  // 2. Seed Government Users (Central, State, Ward, Field Teams from JSON)
  const usersToSeed = loadDemoJson('government_users.json', []);
  for (const user of usersToSeed) {
    let linkedRegionId = null;
    if (user.role === 'ward_monitor' || user.monitoring_ward || user.region_name) {
      if (user.region_name && regionMap[user.region_name]) {
        linkedRegionId = regionMap[user.region_name].id;
      } else if (user.monitoring_ward && regionMap[user.monitoring_ward]) {
        linkedRegionId = regionMap[user.monitoring_ward].id;
      } else if (user.monitoring_ward) {
        const match = Object.values(regionMap).find(r => 
          r.ward === user.monitoring_ward || 
          (r.name && user.monitoring_ward.toLowerCase().includes(r.name.toLowerCase())) ||
          (r.ward && user.monitoring_ward.toLowerCase().includes(r.ward.toLowerCase()))
        );
        if (match) linkedRegionId = match.id;
      } else if (user.email) {
        const match = Object.values(regionMap).find(r => 
          user.email.toLowerCase().includes(r.name.toLowerCase().replace(/\s+/g, ''))
        );
        if (match) linkedRegionId = match.id;
      }
    }

    await db.createGovernmentUser({
      ...user,
      password_hash: user.password_hash || hashPassword(user.password || 'Demo@123'),
      region_id: linkedRegionId
    });
  }
  console.log(`[OK] Government User Accounts seeded: ${usersToSeed.length} accounts.`);

  // 3. Seed Government Offices from JSON
  const officesToSeed = loadDemoJson('government_offices.json', []);
  for (const off of officesToSeed) {
    let regionId = null;
    if (off.region_name && regionMap[off.region_name]) {
      regionId = regionMap[off.region_name].id;
    } else if (off.ward && regionMap[off.ward]) {
      regionId = regionMap[off.ward].id;
    } else if (off.district) {
      const match = Object.values(regionMap).find(r => 
        r.district === off.district && 
        (off.name.toLowerCase().includes(r.name.toLowerCase()) || (r.ward && off.name.toLowerCase().includes(r.ward.toLowerCase())))
      );
      if (match) regionId = match.id;
    }
    await db.upsertGovernmentOffice({
      ...off,
      region_id: regionId
    });
  }
  console.log(`[OK] Government Offices seeded: ${officesToSeed.length} offices.`);

  // 4. Seed Local Representatives from JSON
  const repsToSeed = loadDemoJson('local_representatives.json', []);
  for (const rep of repsToSeed) {
    let regionId = null;
    if (rep.region_name && regionMap[rep.region_name]) {
      regionId = regionMap[rep.region_name].id;
    } else if (rep.ward && regionMap[rep.ward]) {
      regionId = regionMap[rep.ward].id;
    } else if (rep.ward) {
      const match = Object.values(regionMap).find(r => 
        r.ward === rep.ward || (r.name && rep.ward.toLowerCase().includes(r.name.toLowerCase()))
      );
      if (match) regionId = match.id;
    }
    await db.upsertRepresentative({
      ...rep,
      region_id: regionId
    });
  }
  console.log(`[OK] Local Representatives seeded: ${repsToSeed.length} representatives.`);

  // 5. Seed Government Plans from JSON
  const plansToSeed = loadDemoJson('government_plans.json', []);
  for (const plan of plansToSeed) {
    await db.upsertGovernmentPlan(plan);
  }
  console.log(`[OK] Government Plans seeded: ${plansToSeed.length} plans.`);

  // 6. Seed Complete Development Requests Dataset (131 Requests from JSON)
  const requestsToSeed = loadDemoJson('development_requests.json', []);
  for (const req of requestsToSeed) {
    let regionId = null;
    if (req.region_name && regionMap[req.region_name]) {
      regionId = regionMap[req.region_name].id;
    } else if (req.ward && regionMap[req.ward]) {
      regionId = regionMap[req.ward].id;
    } else if (req.village && regionMap[req.village]) {
      regionId = regionMap[req.village].id;
    } else if (req.locality && regionMap[req.locality]) {
      regionId = regionMap[req.locality].id;
    } else if (req.location_details) {
      const match = Object.values(regionMap).find(r => 
        (r.name && req.location_details.toLowerCase().includes(r.name.toLowerCase())) ||
        (r.ward && req.location_details.toLowerCase().includes(r.ward.toLowerCase())) ||
        (r.locality && req.location_details.toLowerCase().includes(r.locality.toLowerCase()))
      );
      if (match) regionId = match.id;
    }
    await db.upsertDemoRequest({
      ...req,
      region_id: regionId
    });
  }
  console.log(`[OK] Development Requests seeded: ${requestsToSeed.length} requests.`);

  // 7. Seed Initial Field Tasks from JSON
  const tasksToSeed = loadDemoJson('field_tasks.json', []);
  const reqResult = await db.getRequests({ state: 'Maharashtra', limit: 500 });
  const allRequests = Array.isArray(reqResult) ? reqResult : (reqResult?.requests || []);
  const reqCodeMap = {};
  allRequests.forEach(r => {
    if (r.request_code) reqCodeMap[r.request_code] = r;
    reqCodeMap[r.id] = r;
  });

  for (const task of tasksToSeed) {
    let linkedReqId = null;
    if (task.request_code && reqCodeMap[task.request_code]) {
      linkedReqId = reqCodeMap[task.request_code].id;
    } else if (task.request_id && reqCodeMap[task.request_id]) {
      linkedReqId = reqCodeMap[task.request_id].id;
    }

    await db.upsertTeamTask({
      ...task,
      request_id: linkedReqId || task.request_id || null
    });
  }
  console.log(`[OK] Field Team Initial Tasks seeded: ${tasksToSeed.length} work orders.`);

  const stats = await db.getStats('Maharashtra');
  console.log('===============================================================');
  console.log(` Maharashtra State Requests: ${stats.total}`);
  console.log(` Categories:`, stats.byCategory);
  console.log(` Urgency:   `, stats.byUrgency);
  console.log(` Districts: `, stats.byDistrict);
  console.log(' Complete demo dataset ready and verified from external JSON.');
  console.log('===============================================================');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}

module.exports = {
  seed,
  loadDemoJson
};
