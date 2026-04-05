import { Router } from 'express';
import authRouter from './auth.routes.js';
import groupsRouter from './group.routes.js';
import shiftsRouter from './shift.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/groups', groupsRouter);
router.use('/shifts', shiftsRouter);

export default router;
