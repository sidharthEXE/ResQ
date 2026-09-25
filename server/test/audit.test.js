import http from 'http';
import app from '../src/index.js';

let server;
let baseUrl;

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = options.headers || {};
  if (options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, {
    ...options,
    headers
  });

  let data;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return {
    status: res.status,
    headers: res.headers,
    data
  };
}

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, detail = '') {
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
  }
}

async function runTests() {
  console.log('\n==================================================');
  console.log('  ResQ / EmergencyFinder — Backend Audit Test Suite');
  console.log('==================================================\n');

  // Start temporary test server on random port
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`  🚀 Test server running at ${baseUrl}\n`);
      resolve();
    });
  });

  try {
    // 1. Health Checks
    console.log('[1] Health-check Probes');
    const health1 = await request('/api/health');
    assert(health1.status === 200 && health1.data.status === 'online', 'GET /api/health responds 200 with status "online"');
    const health2 = await request('/health');
    assert(health2.status === 200 && health2.data.status === 'online', 'GET /health responds 200 (serverless rewrite alias)');

    // 2. Security Headers
    console.log('\n[2] Security Headers');
    assert(health1.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options: nosniff present');
    assert(health1.headers.get('x-frame-options') === 'SAMEORIGIN', 'X-Frame-Options: SAMEORIGIN present');
    assert(health1.headers.get('referrer-policy') === 'strict-origin-when-cross-origin', 'Referrer-Policy present');
    assert(!health1.headers.get('x-powered-by'), 'X-Powered-By is masked');

    // 3. CORS Configuration
    console.log('\n[3] CORS Rules');
    const corsProd = await request('/api/health', {
      headers: { Origin: 'https://resq-services.vercel.app' }
    });
    assert(
      corsProd.headers.get('access-control-allow-origin') === 'https://resq-services.vercel.app',
      'Production origin https://resq-services.vercel.app allowed'
    );

    const corsDev = await request('/api/health', {
      headers: { Origin: 'http://localhost:5173' }
    });
    assert(
      corsDev.headers.get('access-control-allow-origin') === 'http://localhost:5173',
      'Dev origin http://localhost:5173 allowed'
    );

    const corsDisallowed = await request('/api/health', {
      headers: { Origin: 'https://malicious-attacker-website.com' }
    });
    assert(
      !corsDisallowed.headers.get('access-control-allow-origin'),
      'Unauthorized origin cleanly rejected by CORS'
    );

    // 4. Input Validation & Places API
    console.log('\n[4] Places API & Validation');
    const placesMissingParams = await request('/api/places/nearby');
    assert(placesMissingParams.status === 400, 'Missing coordinates rejected with 400 Bad Request');
    assert(placesMissingParams.data.errors?.lat, 'Missing lat reported in field errors');
    assert(placesMissingParams.data.errors?.lng, 'Missing lng reported in field errors');

    const placesInvalidCoords = await request('/api/places/nearby?lat=999&lng=999');
    assert(placesInvalidCoords.status === 400, 'Out-of-range coordinates (>90, >180) rejected with 400');

    const placesNanCoords = await request('/api/places/nearby?lat=abc&lng=def');
    assert(placesNanCoords.status === 400, 'Non-numeric NaN coordinates rejected with 400');

    // Valid places discovery
    const placesValid = await request('/api/places/nearby?lat=28.6139&lng=77.2090&radius=5000&category=hospital');
    assert(placesValid.status === 200, 'Valid coordinates return 200 OK');
    assert(placesValid.data.status === 'success', 'Response contains status: "success"');
    assert(Array.isArray(placesValid.data.data), 'Response data is an array of places');
    assert(placesValid.data.helplines?.national?.universal === '112', 'National emergency helplines returned');

    // Serverless path alias: /places/nearby
    const placesAlias = await request('/places/nearby?lat=28.6139&lng=77.2090&radius=5000&category=all');
    assert(placesAlias.status === 200, 'Serverless alias /places/nearby works without /api prefix');

    // Helplines route
    const helplines = await request('/api/places/helplines');
    assert(helplines.status === 200 && helplines.data.data?.national, 'GET /api/places/helplines returns 200 with helplines');

    // Place by ID
    console.log('\n[5] Place by ID Lookup');
    const verifiedPlace = await request('/api/places/verified-pharmacy-hub-1');
    assert(verifiedPlace.status === 200, 'Lookup verified place by ID returns 200');
    assert(verifiedPlace.data.data?.name?.includes('Apollo 24/7'), 'Verified place returns accurate data');

    const invalidPlaceId = await request('/api/places/invalid*!@#id');
    assert(invalidPlaceId.status === 400, 'Place ID with illegal characters rejected with 400');

    const notFoundPlace = await request('/api/places/osm-node-999999999999');
    assert(notFoundPlace.status === 404, 'Non-existent place ID returns 404 with helpful message');

    // 6. Donors API
    console.log('\n[6] Donor Network API');
    const invalidDonorReg = await request('/api/donors', {
      method: 'POST',
      body: { name: 'A', bloodGroup: 'Z+', phone: '123' } // name too short, invalid blood group, phone too short, missing lat/lng
    });
    assert(invalidDonorReg.status === 400, 'Invalid donor registration rejected with 400');

    const validDonorReg = await request('/api/donors', {
      method: 'POST',
      body: {
        name: 'Sarah Connor',
        bloodGroup: 'O+',
        phone: '+1-555-0199',
        lat: 28.6139,
        lng: 77.2090
      }
    });
    assert(validDonorReg.status === 201, 'Valid donor registration returns 201 Created');
    assert(Boolean(validDonorReg.data.donorId), 'Registration returns a donorId');

    const donorId = validDonorReg.data.donorId;

    // Search donors
    const donorSearch = await request('/api/donors/search?bloodGroup=O+&lat=28.6139&lng=77.2090&radiusKm=25');
    assert(donorSearch.status === 200, 'Search donors returns 200 OK');
    assert(Array.isArray(donorSearch.data), 'Search donors returns array matching frontend contract');
    const foundDonor = donorSearch.data.find((d) => d.name === 'Sarah Connor');
    assert(Boolean(foundDonor), 'Newly registered donor appears in nearby search results');
    if (foundDonor) {
      assert(typeof foundDonor.distanceKm === 'number', 'Donor result has computed distanceKm');
      assert(Boolean(foundDonor.formattedDistance), 'Donor result has formatted distance');
    }

    // Toggle availability
    const toggleAvail = await request(`/api/donors/${donorId}/availability`, {
      method: 'PATCH',
      body: { availability: false }
    });
    assert(toggleAvail.status === 200 && toggleAvail.data.availability === false, 'Donor availability toggled to false');

    // Search again: donor should no longer appear when unavailable
    const donorSearchAfterToggle = await request('/api/donors/search?bloodGroup=O+&lat=28.6139&lng=77.2090&radiusKm=25');
    const hiddenDonor = donorSearchAfterToggle.data.find((d) => d.id === donorId);
    assert(!hiddenDonor, 'Unavailable donor excluded from emergency search');

    // 7. Users API
    console.log('\n[7] Users API');
    const invalidUser = await request('/api/users', {
      method: 'POST',
      body: { name: '', email: 'not-an-email' }
    });
    assert(invalidUser.status === 400, 'Invalid user payload rejected with 400');

    const uniqueEmail = `testuser_${Date.now()}@emergencyresq.org`;
    const validUser = await request('/api/users', {
      method: 'POST',
      body: { name: 'Emergency Volunteer', email: uniqueEmail }
    });
    // Can be 201 (if DB active) or 503 (if DB offline in CI)
    if (validUser.status === 201) {
      assert(validUser.status === 201, 'Valid user created successfully (201)');
      const userId = validUser.data.data._id;

      // Duplicate email conflict check
      const duplicateUser = await request('/api/users', {
        method: 'POST',
        body: { name: 'Duplicate Volunteer', email: uniqueEmail }
      });
      assert(duplicateUser.status === 409, 'Duplicate user email returns 409 Conflict');

      // User lookup
      const userLookup = await request(`/api/users/${userId}`);
      assert(userLookup.status === 200, 'User retrieved by ID returns 200');

      // Invalid ObjectId format
      const invalidObjectId = await request('/api/users/not-an-object-id');
      assert(invalidObjectId.status === 400, 'Malformed ObjectId returns 400 Bad Request instead of 500 CastError');

      // 8. Emergency Contacts API
      console.log('\n[8] Emergency Contacts API');
      const validContact = await request('/api/contacts', {
        method: 'POST',
        body: {
          userId,
          name: 'Jane Doe',
          phone: '+1-555-0144',
          relationship: 'Spouse'
        }
      });
      assert(validContact.status === 201, 'Emergency contact created returns 201');

      const contactList = await request(`/api/contacts/user/${userId}`);
      assert(contactList.status === 200 && contactList.data.count >= 1, 'Contacts retrieved for user returns 200 with list');

      // Non-existent user contact creation check
      const fakeUserId = '507f1f77bcf86cd799439011';
      const orphanedContact = await request('/api/contacts', {
        method: 'POST',
        body: {
          userId: fakeUserId,
          name: 'Ghost Contact',
          phone: '+1-555-0000',
          relationship: 'Friend'
        }
      });
      assert(orphanedContact.status === 404, 'Creating contact for non-existent userId returns 404');
    } else {
      console.log('  ℹ️  MongoDB offline; verifying 503 Controlled Fallback');
      assert(validUser.status === 503, 'Database unavailable returned controlled 503 without crash');
    }

    // 9. 404 Handler
    console.log('\n[9] Not Found 404 Route');
    const notFound = await request('/api/completely-unknown-route');
    assert(notFound.status === 404 && notFound.data.status === 'error', 'Unknown route returns 404 JSON error');

    // 10. NoSQL Query Injection Sanitizer
    console.log('\n[10] NoSQL Injection Protection');
    const injectionAttempt = await request('/api/places/nearby?lat[$gt]=0&lng=77.2090');
    // lat[$gt]=0 will be stripped of $gt, leaving lat undefined -> safe 400 validation error rather than Mongo execution!
    assert(injectionAttempt.status === 400, 'NoSQL query injection operator ($gt) stripped safely');

  } catch (err) {
    console.error('Test execution error:', err);
    failedTests++;
  } finally {
    console.log('\n==================================================');
    console.log(`  Tests Completed: ${passedTests + failedTests}`);
    console.log(`  ✓ Passed: ${passedTests}`);
    console.log(`  ✗ Failed: ${failedTests}`);
    console.log('==================================================\n');

    server.close();
    try {
      const mongoose = (await import('mongoose')).default;
      await mongoose.disconnect();
    } catch (e) {}

    process.exit(failedTests > 0 ? 1 : 0);
  }
}

runTests();

