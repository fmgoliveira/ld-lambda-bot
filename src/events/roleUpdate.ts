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
  name: "roleUpdate",

  run: async (client, oldRole: Role, newRole: Role) => {
    const guildDb = await Guild.findOne({ guildId: newRole.guild.id });
    if (!guildDb) return;

    // Logging Module
    await (async () => {
      const loggingDb = guildDb.modules.logging;
      if (!loggingDb.serverEvents.enabled) return;
      if (!loggingDb.serverEvents.channel) return;
      const channel = newRole.guild.channels.cache.get(loggingDb.serverEvents.channel) as TextChannel | NewsChannel | undefined;
      if (!channel) return;
      if (!loggingDb.serverEvents.events.roleUpdate) return;
      const updatedName = oldRole.name === newRole.name;
      const updatedPosition = oldRole.position === newRole.position;
      const updatedColor = oldRole.color === newRole.color;
      const updatedHoist = oldRole.hoist === newRole.hoist;
      const updatedMentionable = oldRole.mentionable === newRole.mentionable;
      const updatedPermissions = oldRole.permissions === newRole.permissions;

      const embed = {
        author: {
          name: '#' + newRole.name,
        },
        color: loggingDb.serverEvents.color as ColorResolvable,
        description: `**Role Updated**\n${updatedName ? '`Updated Name`' : ''} ${updatedPosition ? '`Updated Position`' : ''} ${updatedPermissions ? '`Updated Permissions`' : ''} ${updatedColor ? '`Updated Color`' : ''} ${updatedHoist ? '`Updated Hoist`' : ''} ${updatedMentionable ? '`Updated Mentionable`' : ''}\n\n${updatedName ? `Old Name: **${oldRole.name}**; New Name: **${newRole.name}**` : ''} ${updatedPosition ? `Old Position: **${oldRole.position}**; New Position: **${newRole.position}**` : ''} ${updatedColor ? `Old Color: **${oldRole.color}**; New Color: **${newRole.color}**` : ''} ${updatedHoist ? `Old Hoist: **${oldRole.hoist}**; New Hoist: **${newRole.hoist}**` : ''} ${updatedMentionable ? `Old Mentionable: **${oldRole.mentionable}**; New Mentionable: **${newRole.mentionable}**` : ''}`,
      }

      await channel.send({ embeds: [embed] }).catch(() => { });
    })();
  }
};