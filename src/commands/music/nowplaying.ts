import { MessageEmbed } from "discord.js";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: "nowplaying",
  description: "Display information on the currently playing song",
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

    await interaction.editReply({
      embeds: [
        {
          description: `${client.customEmojis.loading} Fetching the track information...`,
          color: client.colors.embedColor.decimal,
        }
      ],
    });

    const track = queue.current;
    const methods = ['disabled', 'track', 'queue'];

    const embed = new MessageEmbed()
      .setThumbnail(track.thumbnail)
      .setAuthor({ name: 'Lambda Music System', iconURL: client.customEmojisUrl.music })
      .setTitle(`Now playing: ${track.title}`)
      .setURL(track.url)
      .setDescription(`
        **Author:** ${track.author || 'Unknown'}
        **Description:** ${track.description || 'None'}
        **Duration:** \`${(track.durationMS ? track.duration : 'Live') || 'Unknown'}\`
        **Source:** \`${track.source || 'Unknown'}\`

        **Volume:** \`${queue.volume}%\`
        **Loop Mode:** \`${methods[queue.repeatMode] || 'disabled'}\`
        **Requested by:** ${track.requestedBy || 'Unknown'}
      `)
      .setColor(client.colors.embedColor.decimal);

    await interaction.editReply({
      embeds: [embed],
    });
  },
}