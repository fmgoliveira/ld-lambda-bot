import mongoose, { Schema } from 'mongoose';

export interface Bug {
  id: string;
  
  bugId: number;
  userId: string;
  title: string;
  description: string;
  steps: string;
  expected: string;
  actual: string;
  timestamp: string;
  status: "reported" | "resolved" | "rejected" | "in-progress";
}

const BugSchema = new Schema<Bug>({
  userId: { type: String, required: true },
  bugId: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: false, default: '' },
  steps: { type: String, required: true },
  expected: { type: String, required: true },
  actual: { type: String, required: true },
  timestamp: { type: String, required: true },  
  status: { type: String, required: false, default: 'reported' },
});

export default mongoose.model('bugs', BugSchema);