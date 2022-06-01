import { MessageEmbed } from "discord.js";
import Button from "../../interfaces/Button";

export const button: Button = {
  name: 'music-queue',
  ephemeralReply: true,
  reply: true,

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
          description: `${client.customEmojis.loading} Fetching the queue...`,
          color: client.colors.embedColor.decimal,
        }
      ],
    });

    const methods = ['', client.customEmojis.repeatTrack, client.customEmojis.repeatQueue];

    const embed = new MessageEmbed()
      .setAuthor({ name: 'Lambda Music System', iconURL: client.customEmojisUrl.music })
      .setTitle(`Server Queue - ${interaction.guild!.name} ${methods[queue.repeatMode]}`)
      .setDescription(`
        **Current Track:** ${queue.current.title} | ${queue.current.author} (requested by ${queue.current.requestedBy.username})
          
        ${queue.tracks.length > 0 ? '**Next Tracks:**' : '***No tracks in queue***'}
        ${queue.tracks.length > 0 ?
          queue.tracks.slice(0, 10).map((track, index) => `> **${index + 1}.** ${track.title} | ${track.author} (requested by ${track.requestedBy.username})`).join('\n') + '\n' + (queue.tracks.length > 10 ? `> *+${queue.tracks.length - 10} more.*` : '') + '\n_ _' :
          '\n_ _'
        }
      `)
      .addField(`Queue Status`, `
        **Total Tracks:** ${queue.tracks.length}
        **Volume:** \`${queue.volume}%\`
      `)
      .setColor(client.colors.embedColor.decimal);

    await interaction.editReply({
      embeds: [embed],
    });
  },
}