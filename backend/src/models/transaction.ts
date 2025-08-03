import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  date: String,
  title: {
    type: String,
    required: true,
  },
  user: {
    ref: 'User',
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

transactionSchema.set('toJSON', {
  transform: (_document, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

export default mongoose.model('Transaction', transactionSchema);
