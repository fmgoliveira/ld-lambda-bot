import Button from "../../interfaces/Button";

export const button: Button = {
  name: 'music-stop',
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
          description: `${client.customEmojis.loading} Stopping the music...`,
          color: client.colors.embedColor.decimal,
        }
      ],
    });

    queue.destroy();

    await interaction.editReply({
      embeds: [
        {
          author: { name: 'Stopped music', iconURL: client.customEmojisUrl.success },
          description: `Music stopped in this server, see you next time!`,
          color: client.colors.success.decimal,
        }
      ],
    });
  },
}