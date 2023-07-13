import express from 'express';
import {
  getConversationMessages,
  getAllConversationsMessages,
  sendMessage,
} from '../controllers/message.controller';
import {checkContactExists} from '../middlewares/authorize.middleware'

const router = express.Router();

router.post('/messages', checkContactExists, sendMessage);

// 1. All messages in a conversation with another contact
router.get('/messages/:senderId/:receiverId', checkContactExists, getConversationMessages);

// 2. All conversations between a contact with others
router.get('/allMessages/:contactId', getAllConversationsMessages);



export default router;
