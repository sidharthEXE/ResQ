import mongoose from 'mongoose';
import EmergencyContact from '../models/EmergencyContact.js';
import { contactSchema } from '../validators/mongoValidators.js';

export const createContact = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }
    const validatedData = contactSchema.parse(req.body);
    
    const contact = await EmergencyContact.create(validatedData);
    res.status(201).json(contact);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }
    next(error);
  }
};

export const getUserContacts = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }
    const contacts = await EmergencyContact.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    next(error);
  }
};
