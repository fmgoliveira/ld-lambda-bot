import { Event } from "../interfaces/Event";
import { MessageEmbedOptions, ColorResolvable } from 'discord.js';
import Guild from "../database/models/Guild";
import placeholderReplace from "../utils/placeholderReplace";
import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";
import { NewsChannel } from "discord.js";
import { TextChannel } from "discord.js";
import { Role } from "discord.js";

export const event: Event = {
  name: "roleCreate",

  run: async (client, role: Role) => {
    const guildDb = await Guild.findOne({ guildId: role.guild.id });
    if (!guildDb) return;

    // Logging Module
    await (async () => {
      const loggingDb = guildDb.modules.logging;
      if (!loggingDb.serverEvents.enabled) return;
      if (!loggingDb.serverEvents.channel) return;
      if (!loggingDb.serverEvents.events.roleCreate) return;
      const channelToSend = role.guild.channels.cache.get(loggingDb.serverEvents.channel) as TextChannel | NewsChannel | undefined;
      if (!channelToSend) return;
      const embed = {
        author: {
          name: '@' + role.name,
        },
        color: loggingDb.serverEvents.color as ColorResolvable,
        description: `**Role Created**\n<@&${role.id}> (\`${role.id}\`)`,
      }

      await channelToSend.send({ embeds: [embed] }).catch(() => { });
    })();
  }
};