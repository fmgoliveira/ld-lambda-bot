import { MessageEmbed } from "discord.js";
import { MessageButton } from "discord.js";
import { MessageActionRow } from "discord.js";
import Button from "../../interfaces/Button";
import { aboutPages } from "../../utils/aboutPages";

export const button: Button = {
  name: 'about-firstPage',

  run: async (client, interaction) => {
    return await interaction.update({
      embeds: [aboutPages[0]],
      components: [
        new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId('about-firstPage')
              .setEmoji(client.customEmojis.pagination.firstPage)
              .setDisabled(true)
              .setStyle("SECONDARY"),
            new MessageButton()
              .setCustomId('about-previousPage')
              .setEmoji(client.customEmojis.pagination.previousPage)
              .setDisabled(true)
              .setStyle("SECONDARY"),
            new MessageButton()
              .setCustomId('about-pageNumber')
              .setDisabled(true)
              .setStyle("SECONDARY")
              .setLabel('1/5'),
            new MessageButton()
              .setCustomId('about-nextPage')
              .setEmoji(client.customEmojis.pagination.nextPage)
              .setStyle("SECONDARY"),
            new MessageButton()
              .setCustomId('about-lastPage')
              .setEmoji(client.customEmojis.pagination.lastPage)
              .setStyle("SECONDARY"),
          )
      ]
    });
  },
}