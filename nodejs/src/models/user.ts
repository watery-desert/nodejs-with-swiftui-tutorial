import { Database } from '../database';
import { Db } from 'mongodb';

class User {
  id?: string;
  name: string;
  email: string;
  password: string;

  constructor(name: string, email: string, password: string, id?: string) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.password = password;
  }

  async createUser() {
    const db: Db = Database.getDb();
    delete this.id;
    const insertOneResult = await db.collection('users').insertOne({ ...this });
    return insertOneResult.insertedId.toString();
  }

  static empty = new User('', '', '', '');

  static async getUser(email: string) {
    const db: Db = Database.getDb();
    const document = await db.collection('users').findOne({ email: email });
    if (document != null) {
      return new User(
        document.name,
        document.email,
        document.password,
        document._id.toString()
      );
    } else {
      return User.empty;
    }
  }
}

export default User;
