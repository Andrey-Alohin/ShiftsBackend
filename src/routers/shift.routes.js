import { Router } from 'express';
import { validateBody } from '../utils/validateBody.js';
import { authenticate } from '../middlewares/authenticate.js';
import { requireRoles } from '../middlewares/requireRoles.js';
import { ROLES } from '../constants';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { postShiftsSchema } from '../validation/shifts.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  requireRoles(ROLES.MANAGER),
  validateBody(postShiftsSchema),
  ctrlWrapper(),
);

router.get('/');

export default router;
