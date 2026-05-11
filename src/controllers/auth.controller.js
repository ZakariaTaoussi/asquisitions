import { signupSchema ,signInSchema} from '../validations/auth.validation.js';
import { formatValidationErrors } from '../utils/format.js';
import logger from '../config/logger.js';
import { CreateUser , authenticateUser } from '../services/auth.service.js';
import { jwttoken } from '../utils/jwt.js';
import {cookies} from '../utils/cookies.js';

export const signup = async (req, res, next) => {

    try {

        const validationResult = signupSchema.safeParse(req.body);

        if (!validationResult.success) {

            return res.status(400).json({
                error: 'validation failed',
                details: formatValidationErrors(validationResult.error.issues)
            });
        }

        const { email, name, password, role } = validationResult.data;
        const user = await CreateUser({ name, email, password, role });
        const token = jwttoken.sign({id : user.id , email : user.email , role: user.role });
        cookies.set(res , 'token', token);
        logger.info(`User Registered Successfully ${email}`);

        res.status(201).json({
            message: 'User Registered Successfully',
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {

        logger.error("Signup error:", error);

        if (error.message === "Email already exists") {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        next(error);
    }
}
export const signIn = async (req, res, next) => {
  try {
    const validationResult = signInSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { email, password } = validationResult.data;

    const user = await authenticateUser({ email, password });

    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, 'token', token);

    logger.info(`User signed in successfully: ${email}`);
    res.status(200).json({
      message: 'User signed in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    logger.error('Sign in error', e);

    if (e.message === 'User not found' || e.message === 'Invalid password') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    next(e);
  }
};

export const signOut = async (req, res, next) => {
  try {
    cookies.clear(res, 'token');

    logger.info('User signed out successfully');
    res.status(200).json({
      message: 'User signed out successfully',
    });
  } catch (e) {
    logger.error('Sign out error', e);
    next(e);
  }
};