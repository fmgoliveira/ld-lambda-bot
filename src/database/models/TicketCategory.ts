import mongoose, { Schema } from 'mongoose';

export interface TicketCategory {
  id: string;
  
  guildId: string;

  categoryChannel: string;
  label: string;
  maxTickets: number;
  supportRoles: string[];
  welcomeMessage: {
    message: string;
    color: string;
  };
  deleteOnClose: boolean;
  moveToClosedCategory: boolean;
}

const TicketCategorySchema = new Schema<TicketCategory>({
  id: { type: String, required: true, unique: true },
  guildId: { type: String, required: true },

  categoryChannel: { type: String, required: true },
  label: { type: String, required: true },
  maxTickets: { type: Number, required: true },
  supportRoles: { type: [String], required: true },
  welcomeMessage: {
    type: {
      message: { type: String, required: true },
      color: { type: String, required: true },
    }, required: true
  },
  deleteOnClose: { type: Boolean, required: false, default: false },
  moveToClosedCategory: { type: Boolean, required: false, default: false },
});

export default mongoose.model('ticketCategories', TicketCategorySchema);