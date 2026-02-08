import { GroupsCollection } from '../db/models/Group.js';

export const getAllGroups = async () => {
  const groups = await GroupsCollection.find().lean();

  return groups.map((g) => ({ id: g._id, name: g.name }));
};
