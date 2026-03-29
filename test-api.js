const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ statusCode: res.statusCode, headers: res.headers, body: jsonBody });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAPI() {
  console.log('=== 测试API端点 ===\n');
  
  // 测试 /creator/list
  console.log('1. 测试 GET /creator/list');
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/creator/list',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`   状态码: ${result.statusCode}`);
    console.log(`   响应:`, result.body);
  } catch (error) {
    console.error('   错误:', error.message);
  }
  
  console.log('\n2. 测试 GET /creator/list?status=pending');
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/creator/list?status=pending',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`   状态码: ${result.statusCode}`);
    console.log(`   响应:`, result.body);
  } catch (error) {
    console.error('   错误:', error.message);
  }
  
  console.log('\n3. 测试 GET /health');
  try {
    const result = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`   状态码: ${result.statusCode}`);
    console.log(`   响应:`, result.body);
  } catch (error) {
    console.error('   错误:', error.message);
  }
}

testAPI().catch(console.error);
