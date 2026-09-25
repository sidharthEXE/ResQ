import mongoose from 'mongoose';
import User from '../models/User.js';
import { userSchema, objectIdParamSchema } from '../validators/mongoValidators.js';
import { connectDB } from '../config/db.js';

export const createUser = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ status: 'error', error: 'Database service unavailable' });
    }

    const parsed = userSchema.safeParse(req.body);
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
    const normalizedEmail = validatedData.email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ 
        status: 'error',
        error: 'Conflict', 
        message: 'User with this email already exists' 
      });
    }

    const user = await User.create({
      name: validatedData.name.trim(),
      email: normalizedEmail
    });

    return res.status(201).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ 
        status: 'error',
        error: 'Conflict', 
        message: 'User with this email already exists' 
      });
    }
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const paramParsed = objectIdParamSchema.safeParse(req.params);
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

    const user = await User.findById(paramParsed.data.id).select('-__v');
    if (!user) {
      return res.status(404).json({ status: 'error', error: 'Not Found', message: 'User not found' });
    }

    return res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

