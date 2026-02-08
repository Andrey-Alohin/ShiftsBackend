import { getAllGroups } from '../services/group.services.js';

export const getAllGroupController = async (req, res) => {
  const result = await getAllGroups();

  res.status(200).json({
    status: 200,
    data: result,
  });
};
