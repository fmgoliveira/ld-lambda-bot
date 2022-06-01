import { Event } from "../interfaces/Event";
import { GuildMember, MessageEmbedOptions, ColorResolvable } from 'discord.js';
import Guild from "../database/models/Guild";
import placeholderReplace from "../utils/placeholderReplace";
import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";
import { NewsChannel } from "discord.js";
import { TextChannel } from "discord.js";

export const event: Event = {
  name: "guildMemberUpdate",

  run: async (client, oldMember: GuildMember, newMember: GuildMember) => {
    const guildDb = await Guild.findOne({ guildId: newMember.guild.id });
    if (!guildDb) return;

    let nicknameChng = false;
    let rolesChng = false;
    if (oldMember.nickname !== newMember.nickname) nicknameChng = true;
    if (oldMember.roles.cache !== newMember.roles.cache) rolesChng = true;

    // Logging Module
    await (async () => {
      const loggingDb = guildDb.modules.logging;
      if (!loggingDb.memberEvents.enabled) return;
      if (!loggingDb.memberEvents.channel) return;
      const channel = newMember.guild.channels.cache.get(loggingDb.memberEvents.channel) as TextChannel | NewsChannel | undefined;
      if (!channel) return;
      if (nicknameChng) {
        if (!loggingDb.memberEvents.events.nicknameUpdate) return;
        const embed = {
          author: {
            name: newMember.user.tag,
            icon_url: newMember.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })
          },
          color: loggingDb.memberEvents.color as ColorResolvable,
          description: `**Member Nickname Changed**\nBefore: **${oldMember.nickname}**\nAfter: **${newMember.nickname}**`,
        }
  
        await channel.send({ embeds: [embed] }).catch(() => { });
      }
      if (rolesChng) {
        if (!loggingDb.memberEvents.events.rolesUpdate) return;
        const embed = {
          author: {
            name: newMember.user.tag,
            icon_url: newMember.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })
          },
          color: loggingDb.memberEvents.color as ColorResolvable,
          description: `**Member Roles Changed**\nBefore: ${oldMember.roles.cache.filter(r => r.name !== '@everyone').map(r => `<@&${r.id}>`).join(' ').substring(0, 2000)}\nAfter: **${newMember.roles.cache.filter(r => r.name !== '@everyone').map(r => `<@&${r.id}>`).join(' ').substring(0, 2000)}**`,
        }
  
        await channel.send({ embeds: [embed] }).catch(() => { });
      }
    })();
  }
};