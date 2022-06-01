import { Event } from "../interfaces/Event";
import { GuildMember, MessageEmbedOptions, ColorResolvable } from 'discord.js';
import Guild from "../database/models/Guild";
import placeholderReplace from "../utils/placeholderReplace";
import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";
import { NewsChannel } from "discord.js";
import { TextChannel } from "discord.js";

export const event: Event = {
  name: "guildMemberRemove",

  run: async (client, member: GuildMember) => {
    const guildDb = await Guild.findOne({ guildId: member.guild.id });
    if (!guildDb) return;

    // Leave Module
    await (async () => {
      const leaveDb = guildDb.modules.leave;
      if (!leaveDb.enabled) return;
      if (!leaveDb.dm && !leaveDb.channel) return;
      let leaveEmbed: MessageEmbedOptions = {};

      if (leaveDb.embed.enabled) leaveEmbed = {
        author: leaveDb.embed.author,
        color: leaveDb.embed.color as ColorResolvable,
        description: placeholderReplace(leaveDb.embed.description, member.guild, member.user),
        footer: leaveDb.embed.footer,
        title: leaveDb.embed.title,
        url: leaveDb.embed.titleUrl,
        image: { url: leaveDb.embed.image },
        thumbnail: { url: leaveDb.embed.thumbnail },
      }

      if (leaveDb.dm) await member.send({
        content: leaveDb.embed.enabled ? undefined : placeholderReplace(leaveDb.message, member.guild, member.user),
        embeds: leaveDb.embed.enabled ? [leaveEmbed] : undefined,
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
        const channel = member.guild.channels.cache.get(leaveDb.channel) as TextChannel | NewsChannel | undefined;
        if (channel) await channel.send({
          content: leaveDb.embed.enabled ? undefined : placeholderReplace(leaveDb.message, member.guild, member.user),
          embeds: leaveDb.embed.enabled ? [leaveEmbed] : undefined,
        }).catch(() => { });
      }
    })();

    // Logging Module
    await (async () => {
      const loggingDb = guildDb.modules.logging;
      if (!loggingDb.memberEvents.enabled) return;
      if (!loggingDb.memberEvents.channel) return;
      if (!loggingDb.memberEvents.events.memberLeave) return;
      const channel = member.guild.channels.cache.get(loggingDb.memberEvents.channel) as TextChannel | NewsChannel | undefined;
      if (!channel) return;
      const embed = {
        author: {
          name: member.user.tag,
          icon_url: member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })
        },
        color: loggingDb.memberEvents.color as ColorResolvable,
        description: `**Member Left**\n${member.user.tag}`,
      }

      await channel.send({ embeds: [embed] }).catch(() => { });
    })();
  }
};