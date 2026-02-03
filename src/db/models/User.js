import { Schema } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true, select: false },
  avatarUrl: { type: String, default: undefined },
  role: { type: String, enum: ['employee', 'manager'], default: 'employee' },
});

userSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});
