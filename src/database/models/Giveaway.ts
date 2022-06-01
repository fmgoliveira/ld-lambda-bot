import mongoose, { Schema } from 'mongoose';

export interface User {
  messageId: string,
  channelId: string,
  guildId: string,
  startAt: number,
  endAt: number,
  ended: boolean,
  winnerCount: number,
  prize: string,
  messages: {
      giveaway: string,
      giveawayEnded: string,
      inviteToParticipate: string,
      drawing: string,
      dropMessage: string,
      winMessage: any,
      embedFooter: any,
      noWinner: string,
      winners: string,
      endedAt: string,
      hostedBy: string
  },
  thumbnail: string,
  hostedBy: string,
  winnerIds: string[],
  reaction: any,
  botsCanWin: boolean,
  embedColor: any,
  embedColorEnd: any,
  exemptPermissions: [],
  exemptMembers: string,
  bonusEntries: string,
  extraData: any,
  lastChance: {
      enabled: boolean,
      content: string,
      threshold: number,
      embedColor: mongoose.Mixed
  },
  pauseOptions: {
      isPaused: boolean,
      content: string,
      unPauseAfter: number,
      embedColor: any,
      durationAfterPause: number,
      infiniteDurationText: string
  },
  isDrop: boolean,
  allowedMentions: {
      parse: string[],
      users: string[],
      roles: string[]
  }
}

const giveawaySchema = new Schema({
  messageId: String,
  channelId: String,
  guildId: String,
  startAt: Number,
  endAt: Number,
  ended: Boolean,
  winnerCount: Number,
  prize: String,
  messages: {
      giveaway: String,
      giveawayEnded: String,
      inviteToParticipate: String,
      drawing: String,
      dropMessage: String,
      winMessage: mongoose.SchemaTypes.Mixed,
      embedFooter: mongoose.SchemaTypes.Mixed,
      noWinner: String,
      winners: String,
      endedAt: String,
      hostedBy: String
  },
  thumbnail: String,
  hostedBy: String,
  winnerIds: { type: [String], default: undefined },
  reaction: mongoose.SchemaTypes.Mixed,
  botsCanWin: Boolean,
  embedColor: mongoose.SchemaTypes.Mixed,
  embedColorEnd: mongoose.SchemaTypes.Mixed,
  exemptPermissions: { type: [], default: undefined },
  exemptMembers: String,
  bonusEntries: String,
  extraData: mongoose.SchemaTypes.Mixed,
  lastChance: {
      enabled: Boolean,
      content: String,
      threshold: Number,
      embedColor: mongoose.SchemaTypes.Mixed
  },
  pauseOptions: {
      isPaused: Boolean,
      content: String,
      unPauseAfter: Number,
      embedColor: mongoose.SchemaTypes.Mixed,
      durationAfterPause: Number,
      infiniteDurationText: String
  },
  isDrop: Boolean,
  allowedMentions: {
      parse: { type: [String], default: undefined },
      users: { type: [String], default: undefined },
      roles: { type: [String], default: undefined }
  }
}, { id: false });

export default mongoose.model('giveaways', giveawaySchema);