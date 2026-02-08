import { model, Schema } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'manager'], default: 'user' },
    avatarUrl: { type: String },
    groupId: {
      type: Schema.ObjectId,
      ref: 'Group',
    },
  },
  { timestamps: true, versionKey: false },
);

userSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

export const User = model('User', userSchema);
