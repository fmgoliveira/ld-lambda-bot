import Command from "../../interfaces/Command";

export const command: Command = {
  name: "previous",
  description: "Play the previous song",
  dmOnly: false,
  guildOnly: true,
  category: 'music',
  ephemeralReply: true,
  votedOnly: true,
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

    if (!queue.previousTracks[1]) return await interaction.editReply({
      embeds: [
        {
          author: { name: "No previous tracks", iconURL: client.customEmojisUrl.error },
          description: "There was no music played before.",
          color: client.colors.error.decimal,
        }
      ]
    });

    await interaction.editReply({
      embeds: [
        {
          description: `${client.customEmojis.loading} Loading the previous track...`,
          color: client.colors.embedColor.decimal,
        }
      ],
    });

    await queue.back();

    await interaction.editReply({
      embeds: [
        {
          author: { name: 'Playing previous track', iconURL: client.customEmojisUrl.success },
          description: `Currently playing the previous track on the queue.`,
          color: client.colors.success.decimal,
        }
      ],
    });
  },
}