import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  getUserController,
  getUsersByGroupController,
} from '../controllers/user.controller.js';
import { requireRoles } from '../middlewares/requireRoles.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(authenticate);

router.get('/me', ctrlWrapper(getUserController));

router.get(
  '/',
  requireRoles(ROLES.MANAGER),
  ctrlWrapper(getUsersByGroupController),
);

export default router;
