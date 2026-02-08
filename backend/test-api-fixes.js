/**
 * Test script to verify the API fixes for customer information fetching
 * 
 * This tests the following scenarios:
 * 1. Cookie-based authentication (used by CustomerManagementContext)
 * 2. Bearer token-based authentication (used by other contexts)
 */

import http from 'http';
import jwt from 'jsonwebtoken';

// Generate test tokens
const generateToken = (role = 'SUPER_ADMIN') => {
  const secret = 'your-secret-key-change-this-in-production';
  return jwt.sign(
    { id: 1, role, email: 'admin@test.com', first_name: 'Admin', last_name: 'User' },
    secret,
    { expiresIn: '7d' }
  );
};

const testCookieBasedAuth = () => {
  return new Promise((resolve) => {
    const token = generateToken();
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/customers',
      method: 'GET',
      headers: {
        'Cookie': `shopflow_token=${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const success = res.statusCode === 200 && data.includes('success');
        console.log('✓ Cookie-based auth test:', success ? 'PASSED' : 'FAILED');
        if (!success) console.log('  Response:', res.statusCode, data.substring(0, 100));
        resolve(success);
      });
    });

    req.on('error', (error) => {
      console.log('✗ Cookie-based auth test: FAILED -', error.message);
      resolve(false);
    });
    req.end();
  });
};

const testBearerTokenAuth = () => {
  return new Promise((resolve) => {
    const token = generateToken();
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/customers',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const success = res.statusCode === 200 && data.includes('success');
        console.log('✓ Bearer token auth test:', success ? 'PASSED' : 'FAILED');
        if (!success) console.log('  Response:', res.statusCode, data.substring(0, 100));
        resolve(success);
      });
    });

    req.on('error', (error) => {
      console.log('✗ Bearer token auth test: FAILED -', error.message);
      resolve(false);
    });
    req.end();
  });
};

const testCORSConfiguration = () => {
  return new Promise((resolve) => {
    const token = generateToken();
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/customers',
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:8081',
        'Access-Control-Request-Method': 'GET'
      }
    };

    const req = http.request(options, (res) => {
      const hasAllowedOrigin = res.headers['access-control-allow-origin'];
      const success = hasAllowedOrigin === 'http://localhost:8081' || hasAllowedOrigin === '*';
      console.log('✓ CORS configuration test:', success ? 'PASSED' : 'FAILED');
      if (!success) console.log('  Allowed origins:', hasAllowedOrigin);
      resolve(success);
    });

    req.on('error', (error) => {
      console.log('✗ CORS configuration test: FAILED -', error.message);
      resolve(false);
    });
    req.end();
  });
};

const runAllTests = async () => {
  console.log('\n🧪 Running API Authentication Tests\n');
  console.log('Testing the fixes for customer information fetching...\n');
  
  const results = [
    await testBearerTokenAuth(),
    await testCookieBasedAuth(),
    await testCORSConfiguration(),
  ];

  console.log('\n📊 Test Summary:');
  const passed = results.filter(r => r).length;
  console.log(`  Passed: ${passed}/${results.length}`);
  
  if (passed === results.length) {
    console.log('\n✅ All tests passed! The API should now fetch customer information correctly.\n');
  } else {
    console.log('\n❌ Some tests failed. Check the output above for details.\n');
  }
  
  process.exit(passed === results.length ? 0 : 1);
};

runAllTests();
