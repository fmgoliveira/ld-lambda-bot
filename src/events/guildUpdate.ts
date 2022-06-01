import { Event } from "../interfaces/Event";
import { MessageEmbedOptions, ColorResolvable } from 'discord.js';
import Guild from "../database/models/Guild";
import placeholderReplace from "../utils/placeholderReplace";
import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";
import { NewsChannel } from "discord.js";
import { TextChannel } from "discord.js";
import { Guild as DiscordGuild } from "discord.js";

export const event: Event = {
  name: "guildUpdate",

  run: async (client, oldGuild: DiscordGuild, newGuild: DiscordGuild) => {
    const guildDb = await Guild.findOne({ guildId: newGuild.id });
    if (!guildDb) return;

    // Logging Module
    await (async () => {
      const loggingDb = guildDb.modules.logging;
      if (!loggingDb.serverEvents.enabled) return;
      if (!loggingDb.serverEvents.channel) return;
      const channel = newGuild.channels.cache.get(loggingDb.serverEvents.channel) as TextChannel | NewsChannel | undefined;
      if (!channel) return;
      if (!loggingDb.serverEvents.events.channelUpdate) return;
      const updatedName = oldGuild.name === oldGuild.name;
      const updatedIcon = oldGuild.iconURL() === oldGuild.iconURL();
      const updatedVerificationLevel = oldGuild.verificationLevel === oldGuild.verificationLevel;
      const updatedExplicitContent = oldGuild.explicitContentFilter === oldGuild.explicitContentFilter;
      const updatedDefaultMessageNotifications = oldGuild.defaultMessageNotifications === oldGuild.defaultMessageNotifications;
      const updatedAfkTimeout = oldGuild.afkTimeout === oldGuild.afkTimeout;
      const updatedAfkChannel = oldGuild.afkChannelId === oldGuild.afkChannelId;
      const updatedSystemChannel = oldGuild.systemChannelId === oldGuild.systemChannelId;
        
      const embed = {
        author: {
          name: newGuild.name,
        },
        color: loggingDb.serverEvents.color as ColorResolvable,
        description: `**Server Settings Updated**\n${updatedName ? '`Updated Name`' : ''} ${updatedIcon ? '`Updated Icon`' : ''} ${updatedVerificationLevel ? '`Updated Verification Level`' : ''} ${updatedExplicitContent ? '`Updated Explicit Content Filter`' : ''} ${updatedDefaultMessageNotifications ? '`Updated Default Message Notifications`' : ''} ${updatedAfkTimeout ? '`Updated AFK Timeout`' : ''} ${updatedAfkChannel ? '`Updated AFK Channel`' : ''} ${updatedSystemChannel ? '`Updated System Channel`' : ''}\n\n${updatedName ? `Old Name: **${oldGuild.name}**; New Name: **${newGuild.name}**` : ''} ${updatedIcon ? `Old Icon: **${oldGuild.iconURL()}**; New Icon: **${newGuild.iconURL()}**` : ''} ${updatedVerificationLevel ? `Old Verification Level: **${oldGuild.verificationLevel}**; New Verification Level: **${newGuild.verificationLevel}**` : ''} ${updatedExplicitContent ? `Old Explicit Content Filter: **${oldGuild.explicitContentFilter}**; New Explicit Content Filter: **${newGuild.explicitContentFilter}**` : ''} ${updatedDefaultMessageNotifications ? `Old Default Message Notifications: **${oldGuild.defaultMessageNotifications}**; New Default Message Notifications: **${newGuild.defaultMessageNotifications}**` : ''} ${updatedAfkTimeout ? `Old AFK Timeout: **${oldGuild.afkTimeout}**; New AFK Timeout: **${newGuild.afkTimeout}**` : ''} ${updatedAfkChannel ? `Old AFK Channel: **${oldGuild.afkChannelId}**; New AFK Channel: **${newGuild.afkChannelId}**` : ''} ${updatedSystemChannel ? `Old System Channel: **${oldGuild.systemChannelId}**; New System Channel: **${newGuild.systemChannelId}**` : ''}`,
      }

      await channel.send({ embeds: [embed] }).catch(() => { });
    })();
  }
};