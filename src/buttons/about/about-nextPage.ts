import { MessageEmbed } from "discord.js";
import { MessageButton } from "discord.js";
import { MessageActionRow } from "discord.js";
import Button from "../../interfaces/Button";
import { aboutPages } from "../../utils/aboutPages";

export const button: Button = {
  name: 'about-nextPage',

  run: async (client, interaction) => {
    const page = parseInt(((interaction.message.components![0] as MessageActionRow).components[2] as MessageButton).label?.split('/')[0]!) - 1;

    return await interaction.update({
      embeds: [aboutPages[page + 1]],
      components: [
        new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId('about-firstPage')
              .setEmoji(client.customEmojis.pagination.firstPage)
              .setDisabled(page + 1 < 1)
              .setStyle("SECONDARY"),
            new MessageButton()
              .setCustomId('about-previousPage')
              .setEmoji(client.customEmojis.pagination.previousPage)
              .setDisabled(page + 1 < 1)
              .setStyle("SECONDARY"),
            new MessageButton()
              .setCustomId('about-pageNumber')
              .setDisabled(true)
              .setStyle("SECONDARY")
              .setLabel(`${page + 2}/${aboutPages.length}`),
            new MessageButton()
              .setCustomId('about-nextPage')
              .setEmoji(client.customEmojis.pagination.nextPage)
              .setDisabled(page + 1 > 3)
              .setStyle("SECONDARY"),
            new MessageButton()
              .setCustomId('about-lastPage')
              .setEmoji(client.customEmojis.pagination.lastPage)
              .setDisabled(page + 1 > 3)
              .setStyle("SECONDARY"),
          )
      ]
    });
  },
}