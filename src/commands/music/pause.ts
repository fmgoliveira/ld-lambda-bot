import Command from "../../interfaces/Command";

export const command: Command = {
  name: "pause",
  description: "Pause the current song",
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

    const success = queue.setPaused(true);

    await interaction.editReply({
      embeds: [
        success ?
          {
            author: { name: 'Paused track', iconURL: client.customEmojisUrl.success },
            description: `Successfully paused the music.`,
            color: client.colors.success.decimal,
          } :
          {
            author: { name: 'Track not paused', iconURL: client.customEmojisUrl.error },
            description: `Failed to pause the music.`,
            color: client.colors.error.decimal,
          }
      ],
    });
  },
}