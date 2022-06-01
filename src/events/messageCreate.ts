import { Message, NewsChannel, TextChannel } from "discord.js";
import Guild from "../database/models/Guild";
import Afk from "../database/models/Afk";
import User from "../database/models/User";
import { Event } from "../interfaces/Event";
import Levels from 'discord-xp';
import placeholderReplace from "../utils/placeholderReplace";
import { MessageActionRow } from "discord.js";
import { MessageButton, MessageEmbed } from "discord.js";

export const event: Event = {
  name: 'messageCreate',

  run: async (client, message: Message) => {
    if (!message.guild) return;
    const guildDb = await Guild.findOne({ guildId: message.guild.id });
    if (!guildDb) return;

    // Chat Filter System
    await (async () => {
      if (message.author.bot || message.author.system) return;
      const filterDb = guildDb.modules.chatFilter;
      if (!filterDb.enabled || !filterDb.logChannel || filterDb.words.length === 0) return;
      const logChannel = message.guild!.channels.cache.get(filterDb.logChannel) as TextChannel | NewsChannel | undefined;
      if (!logChannel) return;
      if (filterDb.bypassChannels.includes(message.channel.id)) return;
      if (filterDb.bypassRoles.some((r) => message.member!.roles.cache.has(r))) return;
      if (filterDb.bypassUsers.includes(message.author.id)) return;

      const filtered = filterDb.words.filter(word => message.content.toLowerCase().includes(word.toLowerCase()));
      if (filtered.length > 0) {
        await message.delete().catch(() => { });
        await logChannel.send({
          embeds: [
            {
              author: { name: 'Chat Filter System' },
              description: `**${message.author.tag}** (${message.author.id}) had a message deleted for containing the following forbidden words:\n\`\`\`${filtered.join(' ')}\`\`\``,
              color: client.colors.embedColor.decimal
            }
          ]
        });
      }
    })();

    // Leveling System
    await (async () => {
      if (message.author.bot || message.author.system) return;
      const userDb = await User.findOne({ discordId: message.author.id });
      if (!userDb) return;
      const levelsDb = guildDb.modules.levels;
      if (!levelsDb.enabled) return;
      const noXpRoles = levelsDb.noXpRoles.map(r => message.guild!.roles.cache.get(r));
      const noXpChannels = levelsDb.noXpChannels.map(c => message.guild!.channels.cache.get(c));
      if (noXpRoles.some((r) => r && message.member!.roles.cache.has(r.id)) || noXpChannels.some((c) => c && message.channel.id === c.id)) return;
      let xpRate: number = levelsDb.xpRate;
      const userHasVoted = userDb.voted;
      if (userHasVoted) xpRate = xpRate * 1.25;
      const xp = Math.floor((Math.floor(Math.random() * 19) + 1) * xpRate);
      const user = await Levels.fetch(message.author.id, message.guild!.id)

      const hasLeveledUp = await Levels.appendXp(message.author.id, message.guild!.id, xp);
      if (hasLeveledUp) {
        const roleReward = levelsDb.roleRewards.find(r => r.level === user.level);
        if (roleReward) {
          if (!levelsDb.roleRewardsStack) {
            try {
              message.member!.roles.cache.forEach(async (r) => {
                if (levelsDb.roleRewards.some(role => r.id === role.role)) await message.member!.roles.remove(r.id);
              });
            } catch { }
          }
          try {
            await message.member!.roles.add(roleReward.role);
          } catch { }
        }

        const channelDb = levelsDb.channel;
        if (!channelDb || channelDb === 'disabled') return;
        if (channelDb === 'current') {
          await message.channel.send({
            content: placeholderReplace(levelsDb.message, message.guild!, message.author).replace('{level}', user.level.toString()).substring(0, 2000),
          });
        } else if (channelDb === 'dm') {
          try {
            await message.author.send({
              content: placeholderReplace(levelsDb.message, message.guild!, message.author).replace('{level}', user.level.toString()).substring(0, 2000),
              components: [
                new MessageActionRow().addComponents(
                  new MessageButton()
                    .setLabel(('Sent from: ' + message.guild!.name).substring(0, 80))
                    .setStyle('SECONDARY')
                    .setDisabled(true)
                    .setCustomId('sentFromGuild')
                )
              ]
            });
          } catch { }
        } else {
          const channel = message.guild!.channels.cache.get(channelDb) as TextChannel | NewsChannel | undefined;
          if (!channel) return;
          await channel.send({
            content: placeholderReplace(levelsDb.message, message.guild!, message.author).replace('{level}', user.level.toString()).substring(0, 2000),
          });
        }
      }
    })();

    // AFK System
    await (async () => {
      if (message.author.bot || message.author.system) return;
      await Afk.deleteOne({ guildId: message.guild!.id, userId: message.author.id })

      if (message.mentions.members?.size) {
        const embed = new MessageEmbed()
          .setColor(client.colors.embedColor.decimal)
        message.mentions.members.forEach(m => {
          Afk.findOne({ guildId: message.guild!.id, userId: m.id }, async (err: any, data: any) => {
            if (err) throw err
            if (data) {
              embed.setDescription(`${m} went AFK <t:${parseInt(String(data.timestamp / 1000))}:R>: \`${data.status}\`.`)
              try {
                return message.reply({ embeds: [embed] })
              } catch (e) {
                console.log(e)
              }
            }
          })
        })
      }
    })();
  }
}