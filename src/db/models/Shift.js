import { model, Schema } from 'mongoose';

const ShiftSchema = new Schema(
  {
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    actualGroupId: { type: Schema.ObjectId, ref: 'Group', required: true },
    originGroupId: { type: Schema.ObjectId, ref: 'Group', required: true },

    type: {
      type: String,
      enum: ['work', 'day_off'],
      required: true,
    },

    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },

    version: { type: Number, required: true, default: 0 },

    createdBy: { type: Schema.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, versionKey: false },
);

ShiftSchema.index({ user: 1, actualGroupId: 1, startAt: 1 });

export const ShiftsCollection = model('Shift', ShiftSchema);
