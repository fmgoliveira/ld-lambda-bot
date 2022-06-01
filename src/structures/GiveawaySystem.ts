import { GiveawaysManager } from 'discord-giveaways';
import Giveaway from '../database/models/Giveaway';

export const ExtendedGiveawaysManager = class extends GiveawaysManager {
  async getAllGiveaways() {
    return await Giveaway.find().lean().exec();
  }

  async saveGiveaway(messageId: string, giveawayData: any) {
    await Giveaway.create(giveawayData);
    return true;
  }

  async editGiveaway(messageId: string, giveawayData: any) {
    await Giveaway.updateOne({ messageId }, giveawayData, { omitUndefined: true }).exec();
    return true;
  }

  async deleteGiveaway(messageId: string) {
    await Giveaway.deleteOne({ messageId }).exec();
    return true;
  }
};