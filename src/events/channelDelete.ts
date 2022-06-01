import { Event } from "../interfaces/Event";
import { MessageEmbedOptions, ColorResolvable, GuildChannel } from 'discord.js';
import Guild from "../database/models/Guild";
import placeholderReplace from "../utils/placeholderReplace";
import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";
import { NewsChannel } from "discord.js";
import { TextChannel } from "discord.js";

export const event: Event = {
  name: "channelDelete",

  run: async (client, channel: GuildChannel) => {
    const guildDb = await Guild.findOne({ guildId: channel.guild.id });
    if (!guildDb) return;

    // Logging Module
    await (async () => {
      const loggingDb = guildDb.modules.logging;
      if (!loggingDb.serverEvents.enabled) return;
      if (!loggingDb.serverEvents.channel) return;
      if (!loggingDb.serverEvents.events.channelDelete) return;
      const channelToSend = channel.guild.channels.cache.get(loggingDb.serverEvents.channel) as TextChannel | NewsChannel | undefined;
      if (!channelToSend) return;
      const embed = {
        author: {
          name: '#' + channel.name,
        },
        color: loggingDb.serverEvents.color as ColorResolvable,
        description: `**Channel Deleted**\n#${channel.name} (\`${channel.id}\`)`,
      }

      await channelToSend.send({ embeds: [embed] }).catch(() => { });
    })();
  }
};