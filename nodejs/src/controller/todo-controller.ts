import { Request, Response } from 'express';
import Todo from '../models/todo';
import { validationResult } from 'express-validator';

export const getAllTodos = async (req: Request, res: Response) => {
  const userId = res.locals.userId;
  try {
    const todos = await Todo.getTodos(userId);
    res.status(200).json({ message: 'Successfully loaded', todos: todos });
  } catch (error) {
    res.status(400).json({ message: 'failed to load' });
  }
};

export const addTodo = async (req: Request, res: Response) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    res.status(400).json({ message: "can't add empty todo" });
    return;
  }
  const userId = res.locals.userId;
  const { task, isDone } = req.body;
  try {
    const todo = new Todo(userId, task, isDone);
    const todos = await todo.createTodo(userId);
    res.status(200).json({ message: 'Successfully added', todos: todos });
  } catch (error) {
    res.status(400).json({ message: 'failed to load' });
  }
};

export const updateTodo = async (req: Request, res: Response) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    res.status(400).json({ message: "can't add empty todo" });
    return;
  }
  const { todoId } = req.params;
  const { task, isDone } = req.body;
  const userId = res.locals.userId;
  const todo = new Todo(userId, task, isDone, todoId);
  try {
    const todos = await todo.updateTodo(userId);
    res.status(200).json({ message: 'Successfully updated', todos: todos });
  } catch (error) {
    res.status(400).json({ message: 'failed to edit' });
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  const userId = res.locals.userId;
  const { todoId } = req.params;
  try {
    const todos = await Todo.deleteTodo(userId, todoId);
    res.status(200).json({ message: 'Successfully deleted', todos: todos });
  } catch (error) {
    res.status(400).json({ message: 'failed to delete' });
  }
};
