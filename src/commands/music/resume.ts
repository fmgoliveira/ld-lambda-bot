import Command from "../../interfaces/Command";

export const command: Command = {
  name: "resume",
  description: "Resume playing music",
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

    const success = queue.setPaused(false);

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