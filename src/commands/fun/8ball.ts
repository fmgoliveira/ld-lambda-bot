import { MessageEmbed } from "discord.js";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: "8ball",
  description: "Ask the magic 8ball a question",
  category: "fun",
  usage: ['8ball <question>'],
  options: [
    {
      name: 'question',
      description: 'The question to ask the magic 8ball',
      required: true,
      type: 3
    }
  ],
  dmOnly: false,
  guildOnly: false,
  cooldown: 3,
  ephemeralReply: true,

  run: async (client, interaction) => {
    const ques = interaction.options.getString('question')!;
    if (ques.split(' ').length <= 2) return interaction.reply({
      embeds: [
        {
          author: { name: 'Ask a full question', icon_url: client.customEmojisUrl.error},
          description: 'Please ask a full question.',
          color: client.colors.error.decimal
        }
      ]
    });

    const possibleAnswers = [
      'It is certain.',
      'It is decidedly so.',
      'Without a doubt.',
      'Yes definitely.',
      'You may rely on it.',
      
      'As I see it, yes.',
      'Most likely.',
      'Outlook good.',
      'Yes.',
      'Signs point to yes.',
      
      'Reply hazy, try again.',
      'Ask again later.',
      'Better not tell you now.',
      'Cannot predict now.',
      'Concentrate and ask again.',
      
      'Don\'t count on it.',
      'My reply is no.',
      'My sources say no.',
      'Outlook not so good.',
      'Very doubtful.'
    ];
    const result = Math.floor(Math.random() * possibleAnswers.length);

    const embed = new MessageEmbed()
      .setColor(client.colors.embedColor.decimal)
      .setDescription(`${ques}\n\n**${possibleAnswers[result]}**`);
      
    await interaction.editReply({
      embeds: [embed]
    });
  }
}