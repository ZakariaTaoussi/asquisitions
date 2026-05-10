import express from 'express';
import {signup} from '../controllers/auth.controller.js';
const router = express.Router();

router.post ('/sign-up', signup); 
router.post ('/sign-in', (req, res) => {
       res.send('POST /api/auth/sign-in');

}); 
router.post ('/sign-out', (req, res) => {
       res.send('POST /api/auth/sign-out');

}); 
export default router ;