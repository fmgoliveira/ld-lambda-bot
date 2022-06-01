import { QueueRepeatMode } from "discord-player";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: "loop",
  description: "Set the loop mode",
  usage: ['<off|track|queue>'],
  dmOnly: false,
  guildOnly: true,
  category: 'music',
  ephemeralReply: true,
  votedOnly: true,
  options: [
    {
      name: 'mode',
      type: 3,
      description: 'The mode to set the loop to',
      required: true,
      choices: [
        { name: 'off', value: 'off' },
        { name: 'track', value: 'track' },
        { name: 'queue', value: 'queue' },
      ],
    }
  ],

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

    const mode = interaction.options.getString('mode') as 'queue' | 'track' | 'off';

    await interaction.editReply({
      embeds: [
        {
          description: `${client.customEmojis.loading} Loading the previous track...`,
          color: client.colors.embedColor.decimal,
        }
      ],
    });

    if (mode === 'queue') {
      queue.setRepeatMode(QueueRepeatMode.QUEUE);

      await interaction.editReply({
        embeds: [
          {
            author: { name: 'Set loop mode', iconURL: client.customEmojisUrl.success },
            description: `Successfully set the loop mode to \`queue\`.`,
            color: client.colors.success.decimal,
          }
        ],
      });
    } else if (mode === 'track') {
      queue.setRepeatMode(QueueRepeatMode.TRACK);

      await interaction.editReply({
        embeds: [
          {
            author: { name: 'Set loop mode', iconURL: client.customEmojisUrl.success },
            description: `Successfully set the loop mode to \`track\`.`,
            color: client.colors.success.decimal,
          },
        ],
      });
    } else if (mode === 'off') {
      queue.setRepeatMode(QueueRepeatMode.OFF);

      await interaction.editReply({
        embeds: [
          {
            author: { name: 'Set loop mode', iconURL: client.customEmojisUrl.success },
            description: `Successfully disabled the loop.`,
            color: client.colors.success.decimal,
          },
        ],
      });
    }
  },
}