import { Event } from "../interfaces/Event";
import { MessageEmbedOptions, ColorResolvable, Message } from 'discord.js';
import Guild from "../database/models/Guild";
import placeholderReplace from "../utils/placeholderReplace";
import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";
import { NewsChannel } from "discord.js";
import { TextChannel } from "discord.js";

export const event: Event = {
  name: "messageDelete",

  run: async (client, message: Message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    const guildDb = await Guild.findOne({ guildId: message.guild.id });
    if (!guildDb) return;

    // Logging Module
    await (async () => {
      const loggingDb = guildDb.modules.logging;
      if (!loggingDb.messageEvents.enabled) return;
      if (!loggingDb.messageEvents.channel) return;
      if (!loggingDb.messageEvents.events.messageDelete) return;
      const channelToSend = message.guild!.channels.cache.get(loggingDb.messageEvents.channel) as TextChannel | NewsChannel | undefined;
      if (!channelToSend) return;
      const embed = {
        author: {
          name: message.author.tag,
          icon_url: message.author.displayAvatarURL({ format: 'png', dynamic: true }) || undefined,
        },
        color: loggingDb.messageEvents.color as ColorResolvable,
        description: `**Message Deleted**\nIn <#${message.channel!.id}> | ID: (\`${message.id}\`)\n\`\`\`${message.content.substring(0, 3000)}\`\`\``,
      }

      await channelToSend.send({ embeds: [embed] }).catch(() => { });
    })();
  }
};