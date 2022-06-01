import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";
import { Message } from "discord.js";
import Button from "../../interfaces/Button";

export const button: Button = {
  name: 'music-play',
  ephemeralReply: true,
  reply: true,

  run: async (client, interaction) => {
    const queue = client.musicPlayer.getQueue(interaction.guildId!);

    if (!queue || !queue.playing) return await interaction.editReply({
      embeds: [
        {
          author: { name: "No music playing", iconURL: client.customEmojisUrl.error },
          description: "There is no music playing right now.",
          color: client.colors.error.decimal,
        }
      ]
    });

    const success = queue.setPaused(false);

    if (success) await (interaction.message as Message).edit({
      components: [
        new MessageActionRow()
          .setComponents(
            new MessageButton()
              .setCustomId('music-pause')
              .setEmoji(client.customEmojis.pause)
              .setStyle('SECONDARY'),
            new MessageButton()
              .setCustomId('music-stop')
              .setEmoji(client.customEmojis.stop)
              .setStyle('SECONDARY'),
            new MessageButton()
              .setCustomId('music-skip')
              .setEmoji(client.customEmojis.skip)
              .setStyle('SECONDARY'),
            new MessageButton()
              .setCustomId('music-queue')
              .setEmoji(client.customEmojis.queue)
              .setStyle('SECONDARY'),
            new MessageButton()
              .setCustomId('music-shuffle')
              .setEmoji(client.customEmojis.shuffle)
              .setStyle('SECONDARY'),
          )
      ]
    });

    await interaction.editReply({
      embeds: [
        success ?
          {
            author: { name: 'Resumed track', iconURL: client.customEmojisUrl.success },
            description: `Successfully resumed playing music.`,
            color: client.colors.success.decimal,
          } :
          {
            author: { name: 'Track not resumed', iconURL: client.customEmojisUrl.error },
            description: `Failed to resume playing music.`,
            color: client.colors.error.decimal,
          }
      ],
    });
  },
}