import Command from "../../interfaces/Command";
import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";

export const command: Command = {
  name: "support",
  description: "Join Lambda Development server and get help with Lambda Bot",
  dmOnly: false,
  guildOnly: false,
  category: 'general',

  run: async (client, interaction) => {
    await interaction.editReply({
      embeds: [
        {
          author: {
            name: "Need Help?",
            icon_url: client.user?.displayAvatarURL({ dynamic: true }) || undefined,
          },
          description: `**[Click here to join Lambda Development](${client.mainGuildLink})**`,
          color: client.colors.mainColor.decimal,
        }
      ],
      components: [
        new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setLabel('Support Server')
              .setURL(client.mainGuildLink)
              .setStyle("LINK")
          )
      ]
    });
  }
}