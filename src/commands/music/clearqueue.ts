import Command from "../../interfaces/Command";

export const command: Command = {
  name: "clearqueue",
  description: "Clear the music queue",
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
          author: { name: "No music in queue", iconURL: client.customEmojisUrl.error },
          description: "There is no music in the queue after the currently playing one. To stop playing the current one, use `/stop`.",
          color: client.colors.error.decimal,
        }
      ]
    });

    await interaction.editReply({
      embeds: [
        {
          description: `${client.customEmojis.loading} Clearing the queue...`,
          color: client.colors.embedColor.decimal,
        }
      ],
    });

    await queue.clear();

    await interaction.editReply({
      embeds: [
        {
          author: { name: 'Cleared queue', iconURL: client.customEmojisUrl.success },
          description: `Successfully cleared the queue.`,
          color: client.colors.success.decimal,
        }
      ],
    });
  },
}