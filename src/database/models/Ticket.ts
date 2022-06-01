import mongoose, { Schema } from 'mongoose';

export interface Ticket {
  id: string;
  
  guildId: string;
  memberId: string;
  otherMembers: string[];
  ticketId: string;
  channelId: string;
  category: string;

  closed: boolean;
  locked: boolean;
  claimed: boolean;
  claimedBy: string;
  lockStaff: boolean;
  messageId: string;
}

const TicketSchema = new Schema<Ticket>({
  guildId: { type: String, required: true },
  memberId: { type: String, required: true },
  otherMembers: { type: [String], required: false, default: [] },
  ticketId: { type: String, required: true },
  channelId: { type: String, required: true },
  category: { type: String, required: true },
  closed: { type: Boolean, required: false, default: false },
  locked: { type: Boolean, required: false, default: false },
  claimed: { type: Boolean, required: false, default: false },
  claimedBy: { type: String, required: false, default: '' },
  lockStaff: { type: Boolean, required: false, default: false },
  messageId: { type: String, required: false, default: '' },
});

export default mongoose.model('tickets', TicketSchema);