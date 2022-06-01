import Command from "../../interfaces/Command";
import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";
import { aboutPages } from "../../utils/aboutPages";

export const command: Command = {
  name: "about",
  description: "Learn more about Lambda Bot",
  dmOnly: false,
  guildOnly: false,
  category: 'general',

  run: async (client, interaction) => {
    await interaction.editReply({
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

    setTimeout(async () => {
      return await interaction.editReply({
        components: []
      });
    }, 90 * 1000);
  }
}