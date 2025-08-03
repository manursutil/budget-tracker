import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    minLength: [3, 'Username must be at least 3 characters long'],
  },
  name: String,
  passwordHash: String,
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
  ],
});

userSchema.set('toJSON', {
  transform: (_document, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

export default mongoose.model('User', userSchema);
