import Command from "../../interfaces/Command";

export const command: Command = {
  name: "join",
  description: "Join the voice channel the user is in",
  dmOnly: false,
  guildOnly: true,
  category: 'music',
  ephemeralReply: true,
  cooldown: 3,

  run: async (client, interaction) => {
    const queue = client.musicPlayer.createQueue(interaction.guild!, {
      metadata: { channel: interaction.channel },
    });
    
    await interaction.editReply({
      embeds: [
        {
          description: `${client.customEmojis.loading} Joining the voice channel...`,
          color: client.colors.embedColor.decimal,
        }
      ],
    });

    try {
      if (!queue.connection) await queue.connect(interaction.member.voice.channel!);
    } catch {
      return await interaction.editReply({
        embeds: [
          {
            author: { name: 'Could not join Voice Channel.', iconURL: client.customEmojisUrl.error },
            description: 'I could not join your voice channel. Please make sure I have the proper permissions and try again.',
            color: client.colors.error.decimal,
          }
        ],
      });
    }


    queue.destroy();

    await interaction.editReply({
      embeds: [
        {
          author: { name: 'Joined voice channel', iconURL: client.customEmojisUrl.success },
          description: `Successfully joined voice channel.`,
          color: client.colors.success.decimal,
        }
      ],
    });
  },
}