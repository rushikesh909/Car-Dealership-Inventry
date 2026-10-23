/**
 * Automated HTTP Smoke Test Script
 * Exercises every endpoint against the live application server, verifying
 * REST status codes, response shapes, and security barriers.
 */
async function runSmokeTests() {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000/api';
  console.log(`\n======================================================`);
  console.log(`Starting Automated HTTP Smoke Test against: ${baseUrl}`);
  console.log(`======================================================\n`);

  let testsPassed = 0;
  let testsFailed = 0;

  async function request(
    method: string,
    endpoint: string,
    body?: any,
    token?: string,
  ) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    let data: any = null;
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    return { status: res.status, data };
  }

  function assert(condition: boolean, testName: string, actual?: any) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      testsPassed++;
    } else {
      console.error(`  [FAIL] ${testName} (Got: ${JSON.stringify(actual)})`);
      testsFailed++;
    }
  }

  try {
    const testEmail = `smoketest-${Date.now()}@dealership.com`;
    const password = 'SmokePassword123!';

    // 1. POST /api/auth/register -> 201
    const regRes = await request('POST', '/auth/register', { email: testEmail, password });
    assert(regRes.status === 201 && regRes.data.email === testEmail, '1. POST /api/auth/register -> 201 Created', regRes.status);

    // 2. POST /api/auth/register (duplicate) -> 409
    const dupRes = await request('POST', '/auth/register', { email: testEmail, password });
    assert(dupRes.status === 409, '2. POST /api/auth/register duplicate email -> 409 Conflict', dupRes.status);

    // 3. POST /api/auth/login -> 200
    const loginRes = await request('POST', '/auth/login', { email: testEmail, password });
    assert(loginRes.status === 200 && !!loginRes.data.accessToken, '3. POST /api/auth/login -> 200 OK with accessToken', loginRes.status);
    const userToken = loginRes.data.accessToken;

    // 4. POST /api/auth/login (bad password) -> 401
    const badLoginRes = await request('POST', '/auth/login', { email: testEmail, password: 'WrongPassword999!' });
    assert(badLoginRes.status === 401 && badLoginRes.data.message === 'Invalid credentials', '4. POST /api/auth/login invalid credentials -> 401 Unauthorized', badLoginRes.status);

    // 5. Admin Login -> 200
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@cardealership.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecurePassword123!';
    const adminLoginRes = await request('POST', '/auth/login', { email: adminEmail, password: adminPassword });
    assert(adminLoginRes.status === 200 && adminLoginRes.data.user.role === 'ADMIN', '5. POST /api/auth/login as Admin -> 200 OK (ADMIN role)', adminLoginRes.status);
    const adminToken = adminLoginRes.data.accessToken;

    // 6. POST /api/vehicles (auth) -> 201
    const createRes = await request(
      'POST',
      '/vehicles',
      { make: 'SmokeTestMake', model: 'TurboSpec', category: 'Coupe', price: 55000, quantity: 2 },
      userToken,
    );
    assert(createRes.status === 201 && createRes.data.make === 'SmokeTestMake', '6. POST /api/vehicles (auth) -> 201 Created', createRes.status);
    const vehicleId = createRes.data.id;

    // 7. GET /api/vehicles (auth) -> 200
    const listRes = await request('GET', '/vehicles?page=1&limit=5', undefined, userToken);
    assert(listRes.status === 200 && Array.isArray(listRes.data.data), '7. GET /api/vehicles (auth) -> 200 OK paginated list', listRes.status);

    // 8. GET /api/vehicles/search (auth) -> 200
    const searchRes = await request('GET', '/vehicles/search?make=SmokeTestMake', undefined, userToken);
    assert(searchRes.status === 200 && searchRes.data.data.length >= 1, '8. GET /api/vehicles/search (auth) -> 200 OK search filtered', searchRes.status);

    // 9. GET /api/vehicles/search minPrice > maxPrice -> 400
    const badSearchRes = await request('GET', '/vehicles/search?minPrice=90000&maxPrice=10000', undefined, userToken);
    assert(badSearchRes.status === 400, '9. GET /api/vehicles/search (minPrice > maxPrice) -> 400 Bad Request', badSearchRes.status);

    // 10. PUT /api/vehicles/:id (auth) -> 200
    const updateRes = await request('PUT', `/vehicles/${vehicleId}`, { price: 59000 }, userToken);
    assert(updateRes.status === 200 && Number(updateRes.data.price) === 59000, '10. PUT /api/vehicles/:id (auth) -> 200 OK partial update', updateRes.status);

    // 11. POST /api/vehicles/:id/purchase (auth) -> 200
    const purchaseRes1 = await request('POST', `/vehicles/${vehicleId}/purchase`, undefined, userToken);
    assert(purchaseRes1.status === 200 && purchaseRes1.data.quantity === 1, '11. POST /api/vehicles/:id/purchase -> 200 OK (decrements to 1)', purchaseRes1.status);

    const purchaseRes2 = await request('POST', `/vehicles/${vehicleId}/purchase`, undefined, userToken);
    assert(purchaseRes2.status === 200 && purchaseRes2.data.quantity === 0, '12. POST /api/vehicles/:id/purchase -> 200 OK (decrements to 0)', purchaseRes2.status);

    // 13. POST /api/vehicles/:id/purchase at zero stock -> 409
    const purchaseRes3 = await request('POST', `/vehicles/${vehicleId}/purchase`, undefined, userToken);
    assert(purchaseRes3.status === 409, '13. POST /api/vehicles/:id/purchase at zero stock -> 409 Conflict', purchaseRes3.status);

    // 14. POST /api/vehicles/:id/restock non-admin -> 403
    const restockForbidden = await request('POST', `/vehicles/${vehicleId}/restock`, { amount: 5 }, userToken);
    assert(restockForbidden.status === 403, '14. POST /api/vehicles/:id/restock non-admin -> 403 Forbidden', restockForbidden.status);

    // 15. POST /api/vehicles/:id/restock as ADMIN -> 200
    const restockAdmin = await request('POST', `/vehicles/${vehicleId}/restock`, { amount: 5 }, adminToken);
    assert(restockAdmin.status === 200 && restockAdmin.data.quantity === 5, '15. POST /api/vehicles/:id/restock as ADMIN -> 200 OK (restocked to 5)', restockAdmin.status);

    // 16. DELETE /api/vehicles/:id non-admin -> 403
    const deleteForbidden = await request('DELETE', `/vehicles/${vehicleId}`, undefined, userToken);
    assert(deleteForbidden.status === 403, '16. DELETE /api/vehicles/:id non-admin -> 403 Forbidden', deleteForbidden.status);

    // 17. DELETE /api/vehicles/:id as ADMIN -> 204
    const deleteAdmin = await request('DELETE', `/vehicles/${vehicleId}`, undefined, adminToken);
    assert(deleteAdmin.status === 204, '17. DELETE /api/vehicles/:id as ADMIN -> 204 No Content', deleteAdmin.status);

    // 18. GET /api/vehicles/:id after delete -> 404
    const getDeleted = await request('GET', `/vehicles/${vehicleId}`, undefined, userToken);
    assert(getDeleted.status === 404, '18. GET /api/vehicles/:id after deletion -> 404 Not Found', getDeleted.status);

    console.log(`\n======================================================`);
    console.log(`HTTP Smoke Test Results: ${testsPassed} Passed, ${testsFailed} Failed`);
    console.log(`======================================================\n`);

    if (testsFailed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Smoke test execution crashed:', error);
    process.exit(1);
  }
}

runSmokeTests();
