import { Types } from 'mongoose';

export interface ICategory {
  _id?: Types.ObjectId;
  id?: string;
  userId: Types.ObjectId;
  name: string;
  type: 'income' | 'expense';
  color: string;
  isActive?: boolean;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
