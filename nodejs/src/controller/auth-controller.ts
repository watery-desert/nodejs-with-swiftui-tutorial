import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user';

export const signupController = async (req: Request, res: Response) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    const errorMessage = error.array()[0].msg;
    res.status(400).json({ message: errorMessage });
    return;
  }

  const { name, email, password } = req.body;

  const user = await User.getUser(email);

  if (user !== User.empty) {
    res.status(400).json({ message: 'This email is already used' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = new User(name, email, hashedPassword);
  const userId = await newUser.createUser();

  const token = jwt.sign({ email: email, userId: userId }, 'mySecretKey', {
    expiresIn: '1h',
  });

  res.status(200).json({ token: token, userId: userId });
};

export const loginController = async (req: Request, res: Response) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    const errorMessage = error.array()[0].msg;
    res.status(400).json({ message: errorMessage });
    return;
  }

  const { email, password } = req.body;

  const user = await User.getUser(email);
  if (user === User.empty) {
    res
      .status(400)
      .json({ message: 'No user found with this email. Please sign up!' });
    return;
  }

  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) {
    res.status(400).json({ message: 'Wrong password, enter correct one.' });
    return;
  }

  const token = jwt.sign(
    {
      email: email,
      userId: user.id,
    },
    'mySecretKey',
    { expiresIn: '1h' }
  );

  res.status(200).json({ token: token, userId: user.id });
};
