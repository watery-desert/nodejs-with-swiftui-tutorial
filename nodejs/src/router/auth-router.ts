import { Router } from 'express';
import * as authController from '../controller/auth-controller';
import { body } from 'express-validator';

const router = Router();

router.put(
  '/signup',
  [
    body('name').trim().isLength({ min: 3 }).withMessage('Too small name'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),

    body('password')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Too small password'),
  ],
  authController.signupController
);

router.post(
  '/login',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),

    body('password')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Too small password'),
  ],
  authController.loginController
);

export default router;
