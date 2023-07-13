import { Request, Response } from 'express';
import Contact from '../models/contact';
import { StatusCode, ErrorMessage } from '../enums/error-codes.enum'
export const createContact = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const contact = await Contact.create({ name, email });
    res.status(201).json(contact);
  } catch (error) {
    console.error(error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: ErrorMessage.INTERNAL_SERVER_ERROR });
  }
};

export const listContacts = async (req: Request, res: Response) => {
  try {
    const contacts = await Contact.findAll();
    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: ErrorMessage.INTERNAL_SERVER_ERROR });
  }
};
export const findOneContact = async (req: Request, res: Response) => {
  const { senderId } = req.body;

  try {
    const contact = await Contact.findOne({ where: { id: senderId } });
    if (!contact) {
      return res.status(StatusCode.NOT_FOUND).json({ error: ErrorMessage.CONTACT_NOT_FOUND });
    }

    return res.json(contact);
  } catch (error) {
    return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
  }
};
