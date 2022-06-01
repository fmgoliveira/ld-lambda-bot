import ms from "ms";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: "seek",
  description: "Seek to a specific time in the current track",
  usage: ['seek <time>'],
  options: [
    {
      name: 'time',
      description: 'The time to seek to (1h, 1m, 1s)',
      required: true,
      type: 3,
    },
  ],
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

    const timeMS = ms(interaction.options.getString('time')!);

    if (!timeMS || timeMS >= queue.current.durationMS) return await interaction.editReply({
      embeds: [
        {
          author: { name: "Invalid time specified", iconURL: client.customEmojisUrl.error },
          description: "The time specified is invalid. It must be a valid time (1h, 1m, 1s) and cannot be greater than the duration of the current track.",
          color: client.colors.error.decimal,
        }
      ]
    });

    await interaction.editReply({
      embeds: [
        {
          description: `${client.customEmojis.loading} Seeking for the specified time...`,
          color: client.colors.embedColor.decimal,
        }
      ],
    });

    await queue.seek(timeMS);

    await interaction.editReply({
      embeds: [
        {
          author: { name: 'Time set on current song', iconURL: client.customEmojisUrl.success },
          description: `Successfully changed the song time to \`${ms(timeMS, { long: true })}\`.`,
          color: client.colors.success.decimal,
        }
      ],
    });
  },
}