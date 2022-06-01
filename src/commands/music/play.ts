import { QueryType } from "discord-player";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: "play",
  description: "Play a song",
  dmOnly: false,
  guildOnly: true,
  category: 'music',
  usage: ['play <query (song_name/url)>'],
  ephemeralReply: true,
  options: [
    {
      name: 'query',
      description: 'The song you want to play or its URL',
      type: 3,
      required: true,
    }
  ],

  run: async (client, interaction) => {
    const query = interaction.options.getString('query')!;

    const res = await client.musicPlayer.search(query, {
      requestedBy: interaction.member,
      searchEngine: QueryType.AUTO,
    });

    if (!res || !res.tracks.length) return await interaction.editReply({
      embeds: [
        {
          author: { name: 'No results found.', iconURL: client.customEmojisUrl.error },
          description: 'There were no results for your query.',
          color: client.colors.error.decimal,
        }
      ],
    });

    const queue = client.musicPlayer.createQueue(interaction.guild!, {
      metadata: { channel: interaction.channel },
    });

    try {
      if (!queue.connection) await queue.connect(interaction.member.voice.channel!);
    } catch {
      client.musicPlayer.deleteQueue(interaction.guildId!);
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

    await interaction.editReply({
      embeds: [
        {
          description: `${client.customEmojis.loading} Loading your ${res.playlist ? 'playlist' : 'track'}...`,
          color: client.colors.embedColor.decimal,
        }
      ],
    });

    res.playlist ? queue.addTracks(res.tracks) : queue.addTrack(res.tracks[0]);

    if (!queue.playing) await queue.play();

    await interaction.editReply({
      embeds: [
        {
          author: { name: 'Successfully added to queue', iconURL: client.customEmojisUrl.success },
          description: `Added ${res.playlist ? 'playlist' : 'track'} to queue.`,
          color: client.colors.success.decimal,
        }
      ],
    });
  },
}