import ChildModel from "./child.model.js";

export const addChild = async (req, res) => {
  const newChild = await ChildModel.create({
    ...req.body,
    balance: 0,
    rewardsGained: 0,
    rewardsPlanned: 0,
  });
  const parent = req.user;
  parent.children.push(newChild);
  await parent.save();
  return res.status(201).send({
    balance: newChild.balance,
    rewardsGained: newChild.rewardsGained,
    rewardsPlanned: newChild.rewardsPlanned,
    tasks: newChild.tasks,
    gifts: newChild.gifts,
    name: newChild.name,
    gender: newChild.gender,
    id: newChild._id,
  });
};
