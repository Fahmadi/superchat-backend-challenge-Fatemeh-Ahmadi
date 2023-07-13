import { Request, Response, NextFunction } from 'express';
import Contact from '../models/contact'
export interface CustomRequest extends Request {
    contact?: any;
}

export const checkContactExists = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const senderId = req.body.senderId || req.params.senderId
      const senderContact = await Contact.findOne({ where: { id: senderId } });
      if(!senderContact) {
        return res.status(404).json({ error: 'sender contact not found' });
      }

      const receiverId = req.body.receiverId || req.params.receiverId
      const receiverContact = await Contact.findOne({ where: { id: receiverId } });
      if(!receiverContact) {
        return res.status(404).json({ error: 'receiver contact not found' });
      }
      // Attach the contact to the request object for further processing
      req.contact = senderContact;
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Failed to check contact existence' });
    }
  };
  