import Router from 'koa-router';
import ApiRoute from './api.js';
import HtmlRoute from './html.js';

const router = new Router();

router.use('/api', ApiRoute.routes());
router.use('/html', HtmlRoute.routes());

export default router;
