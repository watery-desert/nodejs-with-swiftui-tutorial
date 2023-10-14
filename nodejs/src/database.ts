import { MongoClient, Db } from 'mongodb';

export class Database {
  private static mongoClient: MongoClient;

  private constructor() {}

  static async initilize() {
    this.mongoClient = await MongoClient.connect(
      'paste your mongodb link here'
    );
  }

  static getDb() {
    return this.mongoClient.db();
  }
}
