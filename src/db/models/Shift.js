import { model, Schema } from 'mongoose';

const ShiftSchema = new Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    createdBy: { type: Schema.ObjectId, ref: 'User', required: true },
    groupId: { type: Schema.ObjectId, ref: 'Group', required: true },
    weekStart: { type: Date, required: true },
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

ShiftSchema.index({ groupId: 1, weekStart: 1 });

export const ShiftsCollection = model('Shift', ShiftSchema);
