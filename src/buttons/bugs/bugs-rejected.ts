import { MessageEmbed } from "discord.js";
import { MessageButton } from "discord.js";
import { Message } from "discord.js";
import { MessageEmbedAuthor } from "discord.js";
import { MessageActionRow } from "discord.js";
import Bug from "../../database/models/Bug";
import Button from "../../interfaces/Button";

export const button: Button = {
  name: 'bugs-rejected',
  denyDeferReply: true,

  run: async (client, interaction) => {
    const bug = await Bug.findOne({ bugId: parseInt(interaction.message.embeds[0].title!.split('#')[1]) });
    if (!bug) {
      interaction.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: "Bug Not Found",
              iconUrl: client.customEmojisUrl.error,
            } as MessageEmbedAuthor)
            .setDescription("The bug you are looking for does not exist. The Bug Report message will be deleted from this channel.")
            .setColor(client.colors.error.decimal)
        ],
        ephemeral: true,
      });
      return await (interaction.message as Message).delete().catch(() => { });
    };

    bug.status = 'rejected';
    await bug.save();

    const embed = interaction.message.embeds[0];
    embed.fields![4].value = `${client.customEmojis.rejected} | Rejected`;

    await interaction.update({
      embeds: [embed],
      components: [
        new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId('bugs-reported')
              .setEmoji(client.customEmojis.reported)
              .setStyle('SECONDARY'),
              new MessageButton()
              .setCustomId('bugs-resolved')
              .setEmoji(client.customEmojis.success)
              .setStyle('SECONDARY'),
              new MessageButton()
              .setCustomId('bugs-inprogress')
              .setEmoji(client.customEmojis.inProgress)
              .setStyle('SECONDARY'),
              new MessageButton()
              .setCustomId('bugs-rejected')
              .setEmoji(client.customEmojis.rejected)
              .setDisabled(true)
              .setStyle('SECONDARY'),
          ),
      ],
    })
  },
}