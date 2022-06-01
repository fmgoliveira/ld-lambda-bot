import Command from "../../interfaces/Command";
import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";

export const command: Command = {
  name: "invite",
  description: "Add Lambda Bot to your server",
  dmOnly: false,
  guildOnly: false,
  category: 'general',

  run: async (client, interaction) => {
    await interaction.editReply({
      embeds: [
        {
          author: {
            name: "Invite Lambda Bot",
            icon_url: client.user?.displayAvatarURL({ dynamic: true }) || undefined,
          },
          description: `**[Click here to invite Lambda Bot](${client.inviteLink})**`,
          color: client.colors.mainColor.decimal,
        }
      ],
      components: [
        new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setLabel('Invite Lambda')
              .setURL(client.inviteLink)
              .setStyle("LINK")
          )
      ]
    });
  }
}