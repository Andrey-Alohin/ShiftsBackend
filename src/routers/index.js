import { Router } from 'express';
import authRouter from './auth.routes.js';
import groupsRouter from './group.routes.js';
import shiftsRouter from './shift.routes.js';
import userRouter from './user.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/groups', groupsRouter);
router.use('/shifts', shiftsRouter);
router.use('/users', userRouter);

export default router;
