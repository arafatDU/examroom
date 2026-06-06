import mongoose, { Schema, model, models } from 'mongoose';

const ExamSchema = new Schema({
  examRoomId: { type: Schema.Types.ObjectId, ref: 'ExamRoom', required: true },
  title: { type: String, required: true },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  durationMinutes: { type: Number, required: true },
  startTime: { type: Date },
  endTime: { type: Date },
  status: { 
    type: String, 
    enum: ['DRAFT', 'PUBLISHED', 'COMPLETED'], 
    default: 'DRAFT' 
  }
}, { timestamps: true });

export default models.Exam || model('Exam', ExamSchema);
