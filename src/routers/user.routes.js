import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { getUserController } from '../controllers/user.controller.js';

const router = Router();

router.use(authenticate);

router.get('/me', ctrlWrapper(getUserController));

export default router;
