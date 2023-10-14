import { Database } from '../database';
import { ObjectId, Db } from 'mongodb';

class Todo {
  id?: string;
  userId: string;
  task: string;
  isDone: boolean;

  constructor(userId: string, task: string, isDone: boolean, id?: string) {
    this.id = id;
    this.userId = userId;
    this.task = task;
    this.isDone = isDone;
  }

  async createTodo(userId: string) {
    const db: Db = Database.getDb();
    delete this.id;
    await db.collection('todos').insertOne({ ...this });
    const todos = await Todo.getTodos(userId);
    return todos;
  }

  static async getTodos(userId: string) {
    const db: Db = Database.getDb();
    const documents = await db.collection('todos').find().toArray();

    const todos: Todo[] = documents.map(
      (doc) => new Todo(doc.userId, doc.task, doc.isDone, doc._id.toString())
    );
    return todos;
  }

  async updateTodo(userId: string) {
    const db: Db = Database.getDb();
    await db
      .collection('todos')
      .updateOne(
        { _id: new ObjectId(this.id) },
        { $set: { task: this.task, isDone: this.isDone } }
      );

    const todos = await Todo.getTodos(userId);
    return todos;
  }

  static async deleteTodo(userId: string, todoId: string) {
    const db: Db = Database.getDb();
    await db.collection('todos').deleteOne({ _id: new ObjectId(todoId) });
    const todos = await Todo.getTodos(userId);
    return todos;
  }
}

export default Todo;
