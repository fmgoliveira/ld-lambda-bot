import { MessageEmbed } from "discord.js";
import Command from "../../interfaces/Command";
import axios from 'axios';

export const command: Command = {
  name: "duck",
  description: "Get a random duck image",
  category: "fun",
  dmOnly: false,
  guildOnly: false,
  cooldown: 3,
  ephemeralReply: true,

  run: async (client, interaction) => {
    const { data } = await axios.get('https://random-d.uk/api/v2/random');
    if (!data.url) return await interaction.editReply({
      embeds: [
        {
          author: { name: 'Error', icon_url: client.customEmojisUrl.error },
          description: 'An error occured while fetching the image.',
          color: client.colors.error.decimal
        }
      ]
    });

    const embed = new MessageEmbed()
      .setColor(client.colors.embedColor.decimal)
      .setImage(data.url);

    await interaction.editReply({
      embeds: [embed]
    });
  }
}