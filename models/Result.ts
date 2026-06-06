import mongoose, { Schema, model, models } from 'mongoose';

const ResultSchema = new Schema({
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, default: 0 },
  answersSubmitted: [{
    questionId: { type: Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: { type: String },
    isCorrect: { type: Boolean }
  }],
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default models.Result || model('Result', ResultSchema);
