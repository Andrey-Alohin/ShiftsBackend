import { postShifts, getWeeklySchedule } from '../services/shift.services.js';

export const postShiftsController = async (req, res) => {
  const shifts = await postShifts({
    user: req.user,
    operations: req.body,
    tz: req.tz,
  });

  res.status(201).json({
    status: 201,
    message: 'Shifts processed successfully!',
    data: shifts,
  });
};

export const getScheduleWeeklyController = async (req, res) => {
  const { user, tz } = req;
  const { date } = req.query;
  const schedule = await getWeeklySchedule({ user, date, tz });

  res.status(200).json({
    status: 200,
    message: 'Weekly schedule retrieved successfully.',
    data: schedule,
  });
};
