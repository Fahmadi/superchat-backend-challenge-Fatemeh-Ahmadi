import { Request, Response } from 'express';
import { ErrorMessage, StatusCode } from '../enums/error-codes.enum';

export const receiveMessage = async (req: Request, res: Response) => {
    try {
      const { message } = req.body; // Assuming the message is sent in the request body

      /* Assuming WhatsApp Response is something like this*/
      /* In the WhatsApp Business API configuration, 
        we specify a webhook URL where you can receive 
        incoming message notifications. this URl here is /webhook */
      
      // {
      //   "messages": [
      //     {
      //       "message": {
      //         "from": "whatsapp:+1234567890",
      //         "to": "whatsapp:+9876543210",
      //         "timestamp": 1678392917,
      //         "text": "Hello, this is a message from WhatsApp!",
      //         "type": "text"
      //       }
      //     }
      //   ]
      // }

      // Log the received message
      console.log('Received message:', message);
  
      return res.status(200).end();
    } catch (error) {
      console.error('Error receiving message:', error);
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  };
  