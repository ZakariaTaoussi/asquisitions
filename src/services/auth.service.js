import logger from '../config/logger.js';
import bcrypt from 'bcrypt';
import { db } from '../config/database.js';
import { users } from '../models/user.model.js';
import { eq } from 'drizzle-orm';

export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error('Error hashing password', { error });
    throw new Error('Failed to hash password');
  }
};

export const CreateUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const ExistingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (ExistingUser.length > 0) {
      throw new Error('Email already exists');
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    logger.info(`User Created Successfully ${newUser.email}`);

    return newUser;
  } catch (error) {
    logger.error('Error creating user', { error });

    throw error;
  }
};
export const authenticateUser = async ({ email, password }) => {
  try {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!existingUser) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    logger.info(`User ${existingUser.email} authenticated successfully`);
    return {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
      createdAt: existingUser.createdAt,
    };
  } catch (e) {
    logger.error(`Error authenticating user: ${e}`);
    throw e;
  }
};
