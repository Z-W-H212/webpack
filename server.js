/**
    服务器代码
 */

const express = require('express');

const app = express();

app.use(express.static('build',{ maxAge:1000 * 3600  }))

app.listen(3001,'localhost', () => {
    console.log('服务器已启动, 地址是：http://localhost:3001');
});