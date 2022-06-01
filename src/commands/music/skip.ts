import Command from "../../interfaces/Command";

export const command: Command = {
  name: "skip",
  description: "Skip a song",
  dmOnly: false,
  guildOnly: true,
  category: 'music',
  ephemeralReply: true,
  cooldown: 3,

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

    if (!queue.tracks[0]) return await interaction.editReply({
      embeds: [
        {
          author: { name: "No tracks in queue", iconURL: client.customEmojisUrl.error },
          description: "There are no tracks in the queue after the current one.",
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