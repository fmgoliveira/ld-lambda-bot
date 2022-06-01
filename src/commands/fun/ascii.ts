import { Message, MessageEmbed } from "discord.js";
import Command from "../../interfaces/Command";
import figlet from 'figlet';

export const command: Command = {
  name: "ascii",
  description: "Convert text to ascii art",
  category: "fun",
  usage: ['ascii <text>'],
  options: [
    {
      name: 'text',
      description: 'The text to convert to ascii art',
      required: true,
      type: 3
    }
  ],
  dmOnly: false,
  guildOnly: false,
  cooldown: 3,
  ephemeralReply: true,

  run: async (client, interaction) => {
    const text = interaction.options.getString('text')!;
    if (text.length > 30) return interaction.reply({
      embeds: [
        {
          author: { name: 'Text is too long', icon_url: client.customEmojisUrl.error },
          description: 'Please provide a shorter text (1-30 chars).',
          color: client.colors.error.decimal
        }
      ]
    });

    figlet.text(text, {}, async (err: any, data: any) => {
      await interaction.editReply({
        content: `\`\`\`${data}\`\`\``
      });
    });
  }
}