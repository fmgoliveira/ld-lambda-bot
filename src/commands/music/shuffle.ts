import ms from "ms";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: "shuffle",
  description: "Shuffle the current queue",
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
          author: { name: "No songs in queue", iconURL: client.customEmojisUrl.error },
          description: "There are no songs in the queue after the current one.",
          color: client.colors.error.decimal,
        }
      ]
    });

    await interaction.editReply({
      embeds: [
        {
          description: `${client.customEmojis.loading} Shuffling the queue...`,
          color: client.colors.embedColor.decimal,
        }
      ],
    });

    queue.shuffle();

    await interaction.editReply({
      embeds: [
        {
          author: { name: 'Shuffled queue', iconURL: client.customEmojisUrl.success },
          description: `Successfully shuffled the queue (\`${queue.tracks.length} song(s)\`).`,
          color: client.colors.success.decimal,
        }
      ],
    });
  },
}