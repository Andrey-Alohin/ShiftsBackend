import { postShifts } from '../services/shift.services.js';

export const postShiftsController = async (req, res) => {
  const shifts = await postShifts({
    user: req.user,
    operations: req.body,
    tz: req.tz,
  });

  res.status(201).json({
    status: 201,
    message: 'Succesfully!',
    data: shifts,
  });
};
