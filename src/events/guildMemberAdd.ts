import { Event } from "../interfaces/Event";
import { GuildMember, MessageEmbedOptions, ColorResolvable } from 'discord.js';
import Guild from "../database/models/Guild";
import placeholderReplace from "../utils/placeholderReplace";
import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";
import { NewsChannel } from "discord.js";
import { TextChannel } from "discord.js";

export const event: Event = {
  name: "guildMemberAdd",

  run: async (client, member: GuildMember) => {
    const guildDb = await Guild.findOne({ guildId: member.guild.id });
    if (!guildDb) return;

    // Welcome Module
    await (async () => {
      const welcomeDb = guildDb.modules.welcome;
      if (!welcomeDb.enabled) return;
      if (!welcomeDb.dm && !welcomeDb.channel) return;
      let welcomeEmbed: MessageEmbedOptions = {};

      if (welcomeDb.embed.enabled) welcomeEmbed = {
        author: welcomeDb.embed.author,
        color: welcomeDb.embed.color as ColorResolvable,
        description: placeholderReplace(welcomeDb.embed.description, member.guild, member.user),
        footer: welcomeDb.embed.footer,
        title: welcomeDb.embed.title,
        url: welcomeDb.embed.titleUrl,
        image: { url: welcomeDb.embed.image },
        thumbnail: { url: welcomeDb.embed.thumbnail },
      }

      if (welcomeDb.dm) await member.send({
        content: welcomeDb.embed.enabled ? undefined : placeholderReplace(welcomeDb.message, member.guild, member.user),
        embeds: welcomeDb.embed.enabled ? [welcomeEmbed] : undefined,
        components: [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setStyle('SECONDARY')
              .setDisabled(true)
              .setLabel(`Sent from: ${member.guild.name}`.substring(0, 80))
              .setCustomId('sentFromGuild')
          )
        ]
      }).catch(() => { });
      else {
        const channel = member.guild.channels.cache.get(welcomeDb.channel) as TextChannel | NewsChannel | undefined;
        if (channel) await channel.send({
          content: welcomeDb.embed.enabled ? undefined : placeholderReplace(welcomeDb.message, member.guild, member.user),
          embeds: welcomeDb.embed.enabled ? [welcomeEmbed] : undefined,
        }).catch(() => { });
      }
    })();

    // Autorole Module
    await (async () => {
      const autoroleDb = guildDb.modules.autoroles;
      if (!autoroleDb.enabled) return;
      if (member.user.bot) {
        autoroleDb.botRoles.forEach(async (roleId) => {
          const role = member.guild.roles.cache.get(roleId);
          if (role) await member.roles.add(role).catch(() => { });
        });
      } else {
        autoroleDb.userRoles.forEach(async (roleId) => {
          const role = member.guild.roles.cache.get(roleId);
          if (role) await member.roles.add(role).catch(() => { });
        });
      }
    })();

    // Logging Module
    await (async () => {
      const loggingDb = guildDb.modules.logging;
      if (!loggingDb.memberEvents.enabled) return;
      if (!loggingDb.memberEvents.channel) return;
      if (!loggingDb.memberEvents.events.memberJoin) return;
      const channel = member.guild.channels.cache.get(loggingDb.memberEvents.channel) as TextChannel | NewsChannel | undefined;
      if (!channel) return;
      const embed = {
        author: {
          name: member.user.tag,
          icon_url: member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })
        },
        color: loggingDb.memberEvents.color as ColorResolvable,
        description: `**Member Joined**\n${member.user.tag}`,
      }

      await channel.send({ embeds: [embed] }).catch(() => { });
    })();

    // Alt Detection Module
    await (async () => {
      const altDetectionDb = guildDb.modules.altDetection;
      if (!altDetectionDb.enabled || !altDetectionDb.logChannel) return;
      const logChannel = member.guild.channels.cache.get(altDetectionDb.logChannel) as TextChannel | NewsChannel | undefined;
      if (!logChannel) return;

      const minAge = altDetectionDb.accountAge * 24 * 60 * 60 * 1000;
      const now = Date.now();
      const joinedAt = member.joinedTimestamp || 0;
      if (joinedAt <= now - minAge) return;
      const timeLeft = minAge - (now - joinedAt);
      const action = altDetectionDb.action;

      switch (action) {
        case 'kick':
          await member.kick(`The account must be at least ${altDetectionDb.accountAge} days old`).catch(() => { });
          break;
        case 'ban':
          await member.ban({ reason: `The account must be at least ${altDetectionDb.accountAge} days old`, days: Math.floor(timeLeft / 60 / 60 / 24) }).catch(() => { });
          break;
        case 'timeout':
          await member.timeout(timeLeft, `The account must be at least ${altDetectionDb.accountAge} days old`).catch(() => { });
          break;
      }
    })();
  }
};