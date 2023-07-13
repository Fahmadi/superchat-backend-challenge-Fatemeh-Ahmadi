import { Request, Response } from 'express';
import Message from '../models/message';
import Conversation from '../models/conversation';
import Contact from '../models/contact';
import {Op} from 'sequelize'
import axios from 'axios'
import {CustomRequest} from '../middlewares/authorize.middleware'
import { ErrorMessage, StatusCode } from '../enums/error-codes.enum';

export const sendMessage = async (req: CustomRequest, res: Response) => {
  try {
    const { text, senderId, receiverId } = req.body;
    let conversationId: number

    let substitutedMessage =  await processMessageWithPlaceholders(text, req.contact)
    // Check if a conversation already exists between the sender and receiver IDs
    let message = await Message.findOne({
      where: {
      [Op.or]: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });

  // If no conversation exists, create a new one
  if (!message) {
    let conversation = await Conversation.create({});
    conversationId = conversation.id
  }
  else {
    conversationId =  message.conversationId
  }


    const m = await Message.create({
      text: substitutedMessage,
      conversationId,
      senderId,
      receiverId,
    });
    return res.json(m);
  } catch (error) {
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
  }
};

export const getConversationMessages = async (req: Request, res: Response) => {
    try {
      const { senderId, receiverId } = req.params;
      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        },
        order: [['createdAt', 'ASC']],
      });
      return res.json(messages);
    } catch (error) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  };
  
export const getAllConversationsMessages = async (req: Request, res: Response) => {
    try {
      const { contactId } = req.params;
      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { senderId: contactId },
            { receiverId: contactId },
          ],
        },
        order: [['createdAt', 'ASC']],

      });

    // Group messages by conversation ID
    const groupedMessages = new Map<number, Message[]>();
    messages.forEach((message) => {
      const conversationId = message.conversationId;
      if (!groupedMessages.has(conversationId)) {
        groupedMessages.set(conversationId, []);
      }
      groupedMessages.get(conversationId)?.push(message);
    });

    return res.json(Object.fromEntries(groupedMessages));

    } catch (error) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  };
  
  const processMessageWithPlaceholders = async (message: string, c: Contact): Promise<string> => {
    const placeholdersMap = new Map();
    placeholdersMap.set("{{contact_name}}", async function() {
      const contact = await Contact.findOne({ where: { id: c.id } });
      const contactName = contact?.name;
      return contactName || "";
    });
    placeholdersMap.set("{{bitcoin_price}}", async function getBitcoinPrice() {
      try {
        const response = await axios.get('https://api.coindesk.com/v1/bpi/currentprice/BTC.json');
        const priceData = response.data;
        const priceInUSD = priceData.bpi.USD.rate;
        return priceInUSD || "";
      } catch (error) {
        console.error('Failed to retrieve Bitcoin price:', error);
        return "";
      }
    });
  
    const placeholderPattern = /{{(.*?)}}/g;
    const matches = message.match(placeholderPattern);
  
    if (!matches) {
      return message;
    }
  
    const substitutedValues = await Promise.all(
      matches.map(async (match) => {
        const placeholderValue = await placeholdersMap.get(match)?.();
        return placeholderValue || match;
      })
    );
  
    let substitutedMessage = message;
    matches.forEach((match, index) => {
      substitutedMessage = substitutedMessage.replace(match, substitutedValues[index]);
    });
    return substitutedMessage;
  };
  
  
  

