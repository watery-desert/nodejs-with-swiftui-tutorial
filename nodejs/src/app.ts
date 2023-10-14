import express, { Application } from 'express';
import todoRouter from './router/todo-router';
import authRouter from './router/auth-router';
import { Database } from './database';

const app: Application = express();

app.use(express.json());

app.use('/todo', todoRouter);
app.use('/auth', authRouter);

databseInit();

async function databseInit() {
  await Database.initilize();
  app.listen(8000);
}
