import { Router } from 'express';
import { receiveMessage } from '../controllers/webhook.controller';
const webhookRouter = Router();

webhookRouter.post('/', receiveMessage);

export default webhookRouter;
