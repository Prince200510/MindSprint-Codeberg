import { Message } from '../models/Message.js'

export const getMessages = async (req,res) => {
  const { room } = req.params
  const msgs = await Message.find({room}).sort({createdAt:1}).limit(200)
  res.json(msgs)
}
