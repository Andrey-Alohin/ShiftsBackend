import { model, Schema } from 'mongoose';

const ShiftSchema = new Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    createdBy: { type: Schema.ObjectId, ref: 'User', required: true },
    workPlace: { type: Schema.ObjectId, ref: 'Group', required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['planned', 'completed', 'missed'],
      default: 'planned',
    },
  },
  { timestamps: true },
);

export const ShiftsCollection = model('Shift', ShiftSchema);
