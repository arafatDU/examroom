import mongoose, { Schema, model, models } from 'mongoose';

const ExamRoomSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  visibility: { 
    type: String, 
    enum: ['PUBLIC', 'PRIVATE'], 
    default: 'PRIVATE' 
  },
  enrolledStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default models.ExamRoom || model('ExamRoom', ExamRoomSchema);
