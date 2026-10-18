import { model, Schema } from 'mongoose';
import { ROLES } from '../../constants/index.js';

const userSchema = new Schema(
  {
    lastName: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: [ROLES.USER, ROLES.MANAGER],
      default: ROLES.USER,
    },
    avatarUrl: { type: String },
    groupId: {
      type: Schema.ObjectId,
      ref: 'Group',
      required: true,
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

export const UsersCollection = model('User', userSchema);
