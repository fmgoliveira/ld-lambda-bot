import { Event } from "../interfaces/Event";
import { MessageEmbedOptions, ColorResolvable, Message } from 'discord.js';
import Guild from "../database/models/Guild";
import placeholderReplace from "../utils/placeholderReplace";
import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";
import { NewsChannel } from "discord.js";
import { TextChannel } from "discord.js";

export const event: Event = {
  name: "messageUpdate",

  run: async (client, oldMessage: Message, newMessage: Message) => {
    if (newMessage.author.bot) return;
    if (!newMessage.guild) return;
    const guildDb = await Guild.findOne({ guildId: newMessage.guild.id });
    if (!guildDb) return;


    // Logging Module - Edited Message
    await (async () => {
      if (newMessage.content === oldMessage.content) return;
      const loggingDb = guildDb.modules.logging;
      if (!loggingDb.messageEvents.enabled) return;
      if (!loggingDb.messageEvents.channel) return;
      if (!loggingDb.messageEvents.events.messageUpdate) return;
      const channelToSend = newMessage.guild!.channels.cache.get(loggingDb.messageEvents.channel) as TextChannel | NewsChannel | undefined;
      if (!channelToSend) return;
      const embed = {
        author: {
          name: newMessage.author.tag,
          icon_url: newMessage.author.displayAvatarURL({ format: 'png', dynamic: true }) || undefined,
        },
        color: loggingDb.messageEvents.color as ColorResolvable,
        description: `**Message Updated**\nIn <#${newMessage.channel!.id}> [\`go to message\`](${newMessage.url}) | ID: (\`${newMessage.id}\`)\nOld Message: \`\`\`${oldMessage.content.substring(0, 1500)}\`\`\`\nNew Message: \`\`\`${newMessage.content.substring(0, 1500)}\`\`\``,
      }

      await channelToSend.send({ embeds: [embed] }).catch(() => { });
    })();

    // Logging Module - Pinned Message
    await (async () => {
      if (newMessage.pinned === oldMessage.pinned) return;
      const loggingDb = guildDb.modules.logging;
      if (!loggingDb.messageEvents.enabled) return;
      if (!loggingDb.messageEvents.channel) return;
      if (!loggingDb.messageEvents.events.messagePin) return;
      const channelToSend = newMessage.guild!.channels.cache.get(loggingDb.messageEvents.channel) as TextChannel | NewsChannel | undefined;
      if (!channelToSend) return;
      const embed = {
        author: {
          name: newMessage.author.tag,
          icon_url: newMessage.author.displayAvatarURL({ format: 'png', dynamic: true }) || undefined,
        },
        color: loggingDb.messageEvents.color as ColorResolvable,
        description: `**Message ${newMessage.pinned ? 'Pinned' : 'Unpinned'}**\nIn <#${newMessage.channel!.id}> \`[go to message](${newMessage.url})\` | ID: (\`${newMessage.id}\`)`,
      }

      await channelToSend.send({ embeds: [embed] }).catch(() => { });
    })();
  }
};