import { Router } from 'express';
import * as todoController from '../controller/todo-controller';
import { body } from 'express-validator';
import authValidator from '../middleware/auth-validator';

const router = Router();
const todoValidator = body('task').trim().notEmpty();

router.get('/todos', authValidator, todoController.getAllTodos);
router.post('/todo', authValidator, todoValidator, todoController.addTodo);
router.patch(
  '/:todoId',
  authValidator,
  todoValidator,
  todoController.updateTodo
);
router.delete('/:todoId', authValidator, todoController.deleteTodo);

export default router;
