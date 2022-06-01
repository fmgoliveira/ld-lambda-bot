import { MessageEmbed } from "discord.js";
import Command from "../../interfaces/Command";
import axios from 'axios';

export const command: Command = {
  name: "dog",
  description: "Get a random dog image",
  category: "fun",
  dmOnly: false,
  guildOnly: false,
  cooldown: 3,
  ephemeralReply: true,

  run: async (client, interaction) => {
    const { data } = await axios.get('https://dog.ceo/api/breeds/image/random');
    if (data.status !== 'success') return await interaction.editReply({
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
      .setImage(data.message);

    await interaction.editReply({
      embeds: [embed]
    });
  }
}