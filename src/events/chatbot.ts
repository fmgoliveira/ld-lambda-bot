import { Event } from "../interfaces/Event";
import { Message } from 'discord.js';
import Guild from "../database/models/Guild";
import { chatSend } from "../utils/chatbot";

export const event: Event = {
  name: "messageCreate",

  run: async (client, message: Message) => {
    if (message.author.bot || message.channel.type === 'DM' || message.author.system) return;

    const guildDb = await Guild.findOne({ guildId: message.guildId });
    if (!guildDb) return;

    const chatbotEnabled = guildDb.modules.administration.chatbot.enabled;
    const chatbotAllowedInChannel = guildDb.modules.administration.chatbot.channels.includes(message.channelId);
    if (!chatbotEnabled || !chatbotAllowedInChannel) return;

    chatSend(message);
  }
};