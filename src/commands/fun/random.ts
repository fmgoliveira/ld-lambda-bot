import { MessageEmbed } from "discord.js";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: "random",
  description: "Get a random number between input A and B",
  options: [
    {
      name: 'a',
      description: 'The first number',
      required: true,
      type: 4
    },
    {
      name: 'b',
      description: 'The second number',
      required: true,
      type: 4
    }
  ],
  usage: ['random <a> <b>'],
  category: "fun",
  dmOnly: false,
  guildOnly: false,
  cooldown: 3,
  ephemeralReply: true,

  run: async (client, interaction) => {
    const a = interaction.options.getInteger('a')!;
    const b = interaction.options.getInteger('b')!;
    const result = Math.floor(Math.random() * (b - a + 1)) + a;

    const embed = new MessageEmbed()
      .setColor(client.colors.embedColor.decimal)
      .setDescription(`Your random number between \`${a}\` and \`${b}\` is **${result}**.`);
      
    await interaction.editReply({
      embeds: [embed]
    });
  }
}