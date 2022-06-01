import Command from "../../interfaces/Command";

export const command: Command = {
  name: "leave",
  description: "Leave the voice channel",
  dmOnly: false,
  guildOnly: true,
  category: 'music',
  ephemeralReply: true,
  cooldown: 3,

  run: async (client, interaction) => {
    if (!interaction.guild!.me?.voice.channel) return interaction.editReply({
      embeds: [
        {
          author: { name: 'I\'m not in a voice channel.', iconURL: client.customEmojisUrl.error },
          description: 'I can\'t leave a voice channel because I\'m not in one.',
          color: client.colors.error.decimal,
        }
      ],
    });

    await interaction.editReply({
      embeds: [
        {
          description: `${client.customEmojis.loading} Leaving the voice channel...`,
          color: client.colors.embedColor.decimal,
        }
      ],
    });

    try {
      await interaction.guild!.me!.voice.disconnect();
    } catch {
      return await interaction.editReply({
        embeds: [
          {
            author: { name: 'Could not leave Voice Channel.', iconURL: client.customEmojisUrl.error },
            description: 'I could not leave the voice channel.',
            color: client.colors.error.decimal,
          }
        ],
      });
    }

    await interaction.editReply({
      embeds: [
        {
          author: { name: 'Left voice channel', iconURL: client.customEmojisUrl.success },
          description: `Successfully left voice channel.`,
          color: client.colors.success.decimal,
        }
      ],
    });
  },
}