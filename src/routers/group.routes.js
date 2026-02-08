import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { getAllGroupController } from '../controllers/group.controller.js';

const router = Router();

router.get('/', ctrlWrapper(getAllGroupController));

export default router;
