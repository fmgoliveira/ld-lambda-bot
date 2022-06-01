import { Event } from "../interfaces/Event";
import { MessageEmbedOptions, ColorResolvable } from 'discord.js';
import Guild from "../database/models/Guild";
import placeholderReplace from "../utils/placeholderReplace";
import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";
import { NewsChannel } from "discord.js";
import { TextChannel } from "discord.js";
import { GuildChannel } from "discord.js";

export const event: Event = {
  name: "channelUpdate",

  run: async (client, oldChannel: GuildChannel, newChannel: GuildChannel) => {
    const guildDb = await Guild.findOne({ guildId: newChannel.guild.id });
    if (!guildDb) return;

    // Logging Module
    await (async () => {
      const loggingDb = guildDb.modules.logging;
      if (!loggingDb.serverEvents.enabled) return;
      if (!loggingDb.serverEvents.channel) return;
      const channel = newChannel.guild.channels.cache.get(loggingDb.serverEvents.channel) as TextChannel | NewsChannel | undefined;
      if (!channel) return;
      if (!loggingDb.serverEvents.events.channelUpdate) return;
      const updatedName = oldChannel.name === newChannel.name;
      const updatedPosition = oldChannel.position === newChannel.position;
      const updatedPerms = oldChannel.permissionOverwrites === newChannel.permissionOverwrites;

      const embed = {
        author: {
          name: '#' + newChannel.name,
        },
        color: loggingDb.serverEvents.color as ColorResolvable,
        description: `**Channel Updated**\n${updatedName ? '`Updated Name`' : ''} ${updatedPosition ? '`Updated Position`' : ''} ${updatedPerms ? '`Updated Permissions`' : ''}\n\n${updatedName ? `Old Name: **${oldChannel.name}**; New Name: **${newChannel.name}**` : ''} ${updatedPosition ? `Old Position: **${oldChannel.position}**; New Position: **${newChannel.position}**` : ''}`,
      }

      await channel.send({ embeds: [embed] }).catch(() => { });
    })();
  }
};