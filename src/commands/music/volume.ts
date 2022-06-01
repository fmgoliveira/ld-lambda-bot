import Command from "../../interfaces/Command";

export const command: Command = {
  name: "stop",
  description: "Stop playing music",
  dmOnly: false,
  guildOnly: true,
  category: 'music',
  ephemeralReply: true,
  votedOnly: true,
  usage: ['volume <percentage>'],
  options: [
    {
      name: 'percentage',
      description: '0-200 (10 = 10%)',
      type: 4,
      maxValue: 200,
      minValue: 0,
      required: true,
    }
  ],
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

    const percentage = interaction.options.getInteger('percentage')!;

    await interaction.editReply({
      embeds: [
        {
          description: `${client.customEmojis.loading} Changing the volume...`,
          color: client.colors.embedColor.decimal,
        }
      ],
    });

    queue.setVolume(percentage);

    await interaction.editReply({
      embeds: [
        {
          author: { name: 'Volume changed', iconURL: client.customEmojisUrl.success },
          description: `Successfully set the music volume to \`${percentage}%\`.`,
          color: client.colors.success.decimal,
        }
      ],
    });
  },
}