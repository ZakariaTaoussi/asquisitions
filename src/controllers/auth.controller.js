import { signupSchema } from '../validations/auth.validation.js';
import { formatValidationErrors } from '../utils/format.js';
import logger from '../config/logger.js';
import { CreateUser } from '../services/auth.service.js';
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