import express from 'express';
import { createContact, listContacts } from '../controllers/contact.controller';

const router = express.Router();

router.post('/', createContact);
router.get('/', listContacts);

export default router;
