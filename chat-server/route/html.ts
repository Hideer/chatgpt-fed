import Router from 'koa-router';
import indexController from '../controller/html/index.js';
import signController from '../controller/html/signin.js';

const router = new Router();

router.get('/index', indexController.index);
router.get('/signin', signController.signin);
router.get('/signin-ok', signController.signinOk);
router.get('/signin-failed', signController.signinFailed);

export default router;
