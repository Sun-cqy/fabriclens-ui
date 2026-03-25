// 简单脚本，用于检查当前环境变量设置
console.log('当前环境变量:');
console.log('VITE_API_BASE_URL =', process.env.VITE_API_BASE_URL || '未设置');
console.log('VITE_USE_MOCK_DATA =', process.env.VITE_USE_MOCK_DATA || '未设置');

// 如果使用模拟数据，我们需要设置环境变量来使用实际API
if (process.env.VITE_USE_MOCK_DATA !== 'false') {
    console.log('\n要使用后端API（而不是模拟数据），请设置以下环境变量:');
    console.log('VITE_API_BASE_URL=http://localhost:8080');
    console.log('VITE_USE_MOCK_DATA=false');

    console.log('\n在Windows命令提示符中:');
    console.log('set VITE_API_BASE_URL=http://localhost:8080');
    console.log('set VITE_USE_MOCK_DATA=false');

    console.log('\n在Windows PowerShell中:');
    console.log('$env:VITE_API_BASE_URL="http://localhost:8080"');
    console.log('$env:VITE_USE_MOCK_DATA="false"');
} 