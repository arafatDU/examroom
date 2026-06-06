import mongoose, { Schema, model, models } from 'mongoose';

const JoinRequestSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'ExamRoom', required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED'], 
    default: 'PENDING' 
  },
}, { timestamps: true });

export default models.JoinRequest || model('JoinRequest', JoinRequestSchema);
