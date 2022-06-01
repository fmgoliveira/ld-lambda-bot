import mongoose, { Schema } from 'mongoose';

export interface Afk {
  id: string;
  
  guildId: string;
  userId: string;
  status: string;
  time: string;
}

const AfkSchema = new Schema<Afk>({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  status: { type: String, required: false, default: '' },
  time: { type: String, required: false, default: '' },
});

export default mongoose.model('afk', AfkSchema);