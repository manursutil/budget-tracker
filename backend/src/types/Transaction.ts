import { Types } from 'mongoose';

export interface ITransaction {
  _id?: Types.ObjectId;
  id?: string;
  userId: Types.ObjectId;
  type: 'income' | 'expense';
  amount: number;
  category: Types.ObjectId;
  date: Date;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
