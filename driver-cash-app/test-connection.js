const http = require('http');

const options = {
  hostname: '192.168.0.155',
  port: 5000,
  path: '/api/health',
  method: 'GET'
};

console.log('Testing backend connection...');
console.log(`URL: http://${options.hostname}:${options.port}${options.path}\n`);

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Response:', data);
    console.log('\n🎉 Backend is accessible! Your driver app should work now.');
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.error('\n⚠️  Backend is not accessible. Check:');
  console.error('   1. Backend server is running (npm start in backend folder)');
  console.error('   2. Firewall allows port 5000');
  console.error('   3. IP address is correct (run: ipconfig | findstr "IPv4")');
});

req.end();
