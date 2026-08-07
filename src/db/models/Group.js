import { model, Schema } from 'mongoose';

const DEFAULT_WEEKLY_SCHEDULE = [
  { day: 1, isOpen: true, openTime: '08:00', closeTime: '21:00' },
  { day: 2, isOpen: true, openTime: '08:00', closeTime: '21:00' },
  { day: 3, isOpen: true, openTime: '08:00', closeTime: '21:00' },
  { day: 4, isOpen: true, openTime: '08:00', closeTime: '21:00' },
  { day: 5, isOpen: true, openTime: '08:00', closeTime: '21:00' },
  { day: 6, isOpen: true, openTime: '08:00', closeTime: '19:00' },
  { day: 7, isOpen: true, openTime: '08:00', closeTime: '19:00' },
];

const dayScheduleSchema = new Schema(
  {
    day: { type: Number, required: true },
    isOpen: { type: Boolean, required: true },
    openTime: { type: String, default: null },
    closeTime: { type: String, default: null },
  },
  { _id: false },
);

const groupSchema = new Schema(
  {
    name: { type: String, required: true },
    managerId: { type: Schema.ObjectId, ref: 'User', required: true },
    schedule: {
      type: [dayScheduleSchema],
      default: DEFAULT_WEEKLY_SCHEDULE,
    },
  },
  { timestamps: true, versionKey: false },
);

export const GroupsCollection = model('Group', groupSchema);
