import { MessageEmbed } from "discord.js";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: "dice",
  description: "Roll a dice",
  category: "fun",
  dmOnly: false,
  guildOnly: false,
  cooldown: 3,
  ephemeralReply: true,

  run: async (client, interaction) => {
    const result = Math.floor(Math.random() * 6) + 1;

    const embed = new MessageEmbed()
      .setColor(client.colors.embedColor.decimal)
      .setDescription(`Your dice landed on number **${result}**.`);
      
    await interaction.editReply({
      embeds: [embed]
    });
  }
}