import http from 'http';
import jwt from 'jsonwebtoken';

const generateToken = (role = 'SUPER_ADMIN') => {
  const secret = 'your-secret-key-change-this-in-production';
  return jwt.sign(
    { id: 1, role, email: 'admin@test.com', first_name: 'Admin', last_name: 'User' },
    secret,
    { expiresIn: '7d' }
  );
};

const testSettingsAPI = async (method, endpoint, body = null) => {
  return new Promise((resolve) => {
    const token = generateToken();
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/admin/settings${endpoint}`,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const success = res.statusCode >= 200 && res.statusCode < 300;
        resolve({ status: res.statusCode, success, data });
      });
    });

    req.on('error', (error) => {
      resolve({ status: 0, success: false, error: error.message });
    });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runTests = async () => {
  console.log('\n🧪 Testing Admin Settings API\n');

  // Test 1: Update settings
  console.log('1️⃣  Testing PUT /admin/settings (Update settings)...');
  let result = await testSettingsAPI('PUT', '', {
    settings: {
      storeSettings: { name: 'ShopFlow Store', email: 'admin@shopflow.com' },
      shippingSettings: { standardShippingFee: 10 }
    }
  });
  console.log(`   Status: ${result.status} - ${result.success ? '✅ PASSED' : '❌ FAILED'}`);

  // Test 2: Get all settings
  console.log('2️⃣  Testing GET /admin/settings (Get all settings)...');
  result = await testSettingsAPI('GET', '');
  console.log(`   Status: ${result.status} - ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
  if (result.success) {
    const data = JSON.parse(result.data);
    console.log(`   Settings count: ${Object.keys(data.settings || {}).length}`);
  }

  // Test 3: Get specific setting
  console.log('3️⃣  Testing GET /admin/settings/:key (Get specific setting)...');
  result = await testSettingsAPI('GET', '/storeSettings');
  console.log(`   Status: ${result.status} - ${result.success ? '✅ PASSED' : '❌ FAILED'}`);

  // Test 4: Update single setting
  console.log('4️⃣  Testing PUT /admin/settings/:key (Update single setting)...');
  result = await testSettingsAPI('PUT', '/taxRate', { value: 15 });
  console.log(`   Status: ${result.status} - ${result.success ? '✅ PASSED' : '❌ FAILED'}`);

  // Test 5: Delete setting
  console.log('5️⃣  Testing DELETE /admin/settings/:key...');
  result = await testSettingsAPI('DELETE', '/testKey');
  console.log(`   Status: ${result.status} - ${result.success ? '✅ PASSED' : '❌ FAILED'}`);

  console.log('\n✅ All tests completed!\n');
  process.exit(0);
};

runTests();
