import Button from "../../interfaces/Button";

export const button: Button = {
  name: 'music-skip',
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

    await interaction.editReply({
      embeds: [
        {
          description: `${client.customEmojis.loading} Loading the next track...`,
          color: client.colors.embedColor.decimal,
        }
      ],
    });

    queue.skip();

    await interaction.editReply({
      embeds: [
        {
          author: { name: 'Skipped song', iconURL: client.customEmojisUrl.success },
          description: `Currently track skipped. Playing the next track on the queue.`,
          color: client.colors.success.decimal,
        }
      ],
    });
  },
}