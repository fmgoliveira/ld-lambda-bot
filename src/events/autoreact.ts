import { Event } from "../interfaces/Event";
import { Message } from 'discord.js';
import Guild from "../database/models/Guild";

export const event: Event = {
  name: "messageCreate",

  run: async (client, message: Message) => {
    if (message.channel.type === 'DM') return;

    const guildDb = await Guild.findOne({ guildId: message.guildId });
    if (!guildDb) return;

    const reactsDb = guildDb.modules.administration.autoreact.find((c) => c.channel === message.channelId);
    if (!reactsDb) return;

    reactsDb.emojis.forEach(async (e) => {
      const emoji = e.trim();
      await message.react(message.guild!.emojis.cache.get(emoji) || emoji).catch(async (err) => {
        console.log(err);
        await message.react('⁉️');
      });
    });
  }
};