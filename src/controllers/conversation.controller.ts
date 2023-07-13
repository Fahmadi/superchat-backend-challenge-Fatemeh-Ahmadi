import { Request, Response } from 'express';
import Conversation from '../models/conversation';
import { ErrorMessage, StatusCode } from '../enums/error-codes.enum';

export const createConversation = async (req: Request, res: Response) => {
  try {
    const conversation = await Conversation.create();
    return res.json(conversation);
  } catch (error) {
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const conversations = await Conversation.findAll();
    return res.json(conversations);
  } catch (error) {
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
  }
};
