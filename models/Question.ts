import mongoose, { Schema, model, models } from 'mongoose';

const QuestionSchema = new Schema({
  serialNumber: { type: Number },
  title: { type: String, required: true },
  options: [{
    a: { type: String, required: true },
    b: { type: String, required: true },
    c: { type: String, required: true },
    d: { type: String, required: true }
  }],
  answer: { type: String, required: true }, // 'a', 'b', 'c', or 'd'
  justification: { type: String },
  subject: { type: String, required: true },
  chapter: { type: String },
  board: { type: String }
}, { timestamps: true });

export default models.Question || model('Question', QuestionSchema);
