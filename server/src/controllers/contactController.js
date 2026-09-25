import mongoose from 'mongoose';
import EmergencyContact from '../models/EmergencyContact.js';
import User from '../models/User.js';
import { contactSchema, userIdParamSchema } from '../validators/mongoValidators.js';
import { connectDB } from '../config/db.js';

export const createContact = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ status: 'error', error: 'Database service unavailable' });
    }

    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        status: 'error',
        error: 'Validation Error',
        message: parsed.error.errors[0]?.message || 'Validation Error',
        details: parsed.error.errors,
        errors: parsed.error.flatten().fieldErrors
      });
    }

    const validatedData = parsed.data;

    // Check if the associated user actually exists
    const userExists = await User.findById(validatedData.userId);
    if (!userExists) {
      return res.status(404).json({
        status: 'error',
        error: 'Not Found',
        message: 'Cannot create contact: User with provided userId does not exist'
      });
    }

    const contact = await EmergencyContact.create({
      userId: validatedData.userId,
      name: validatedData.name.trim(),
      phone: validatedData.phone.trim(),
      relationship: validatedData.relationship.trim()
    });

    return res.status(201).json({
      status: 'success',
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

export const getUserContacts = async (req, res, next) => {
  try {
    const paramParsed = userIdParamSchema.safeParse(req.params);
    if (!paramParsed.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user ID format: must be a 24-character hexadecimal ObjectId',
        errors: paramParsed.error.flatten().fieldErrors
      });
    }

    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ status: 'error', error: 'Database service unavailable' });
    }

    const contacts = await EmergencyContact.find({ userId: paramParsed.data.userId })
      .select('-__v')
      .sort({ createdAt: -1 });

    return res.json({
      status: 'success',
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    next(error);
  }
};

