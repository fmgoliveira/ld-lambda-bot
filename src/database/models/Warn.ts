import mongoose, { Schema } from 'mongoose';

export interface Warn {
  id: string;
  
  userId: string;
  guildId: string;
  warnings: {
    moderator: string;
    timestamp: string;
    reason: string;
  }[];
}

const WarnSchema = new Schema<Warn>({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  warnings: { type: [{
    moderator: { type: String, required: true },
    timestamp: { type: String, required: true },
    reason: { type: String, required: true },
  }], required: false, default: [] },
});

export default mongoose.model('warns', WarnSchema);