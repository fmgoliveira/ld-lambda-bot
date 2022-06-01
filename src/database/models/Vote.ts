import mongoose, { Schema } from 'mongoose';

export interface Vote {
  id: string;
  
  userId: string;
  list: string;
  timestamp: string;
}

const VoteSchema = new Schema<Vote>({
  userId: { type: String, required: true },
  list: { type: String, required: true },
  timestamp: { type: String, required: true },
});

export default mongoose.model('votes', VoteSchema);