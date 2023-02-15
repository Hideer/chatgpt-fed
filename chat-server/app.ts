import Koa from 'koa';
import koaBody from 'koa-body';
import koaViews from 'koa-views';
import koaStatic from 'koa-static';
import koaLogger from 'koa-logger';
import router from './route/index.js';
// import xmlParser from 'koa-xml-body'
// import xmlParse from './middleware/xmlParse.js';

import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Koa();

// 解析xml
// app.use(xmlParser());

// 解析 request body:
app.use(koaBody());


// 加载模板引擎
app.use(koaViews(path.join(__dirname, './views'), {
  extension: 'ejs',
}));

// 日志
app.use(koaLogger())

// 静态资源服务
app.use(koaStatic(path.join(__dirname, './public'), {
  maxAge: 30 * 24 * 60 * 60 * 1000, // 一个月
}));

// 路由
app.use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);
console.log('app started at port 3000...');
