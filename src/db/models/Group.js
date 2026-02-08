import { model, Schema } from 'mongoose';

const groupShcema = new Schema(
  {
    name: { type: String, required: true },
    managerId: { type: Schema.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, versionKey: false },
);

export const GroupsCollection = model('Group', groupShcema);
