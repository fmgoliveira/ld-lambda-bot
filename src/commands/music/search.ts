import { QueryType } from "discord-player";
import { MessageSelectMenu } from "discord.js";
import { MessageActionRow } from "discord.js";
import { MessageEmbed } from "discord.js";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: "search",
  description: "Search for a song",
  dmOnly: false,
  guildOnly: true,
  category: 'music',
  usage: ['search <query>'],
  ephemeralReply: true,
  options: [
    {
      name: 'query',
      description: 'The song you want to search for',
      type: 3,
      required: true,
    }
  ],
  cooldown: 3,

  run: async (client, interaction) => {
    const query = interaction.options.getString('query')!;

    await interaction.editReply({
      embeds: [
        {
          description: `${client.customEmojis.loading} Fetching results for your search...`,
          color: client.colors.embedColor.decimal,
        }
      ],
    });

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

    const tracks = res.tracks.slice(0, 25);

    const embed = new MessageEmbed()
      .setAuthor({ name: 'Lambda Music System', iconURL: client.customEmojisUrl.music })
      .setTitle(('Search Results for `' + query + '`').substring(0, 256))
      .setColor(client.colors.embedColor.decimal)
      .setDescription(`
        Here are the results for your search:

        ${tracks.map((track, i) => `> **${i + 1}.** ${track.title} | ${track.author}`).join('\n')}
        
        _ _
      `)
      .setFooter({ text: 'Select a song to add to the queue using the select menu below\n(you have 30 seconds to choose)' });

    const selectMenu = new MessageSelectMenu()
      .setCustomId('music-searchSelect')
      .setPlaceholder('Select a song to add to the queue')
      .setOptions(tracks.map((track, i) => ({
        label: `${i + 1}. ${track.title}`.substring(0, 100),
        description: track.author.substring(0, 100),
        value: track.id,
      })));

    await interaction.editReply({
      embeds: [embed],
      components: [new MessageActionRow().addComponents(selectMenu)],
    });

    const collector = interaction.channel?.createMessageComponentCollector({
      componentType: 'SELECT_MENU',
      time: 30000,
    });

    collector?.on('collect', async (component): Promise<any> => {
      const value = component.values[0];
      const track = tracks.find((t) => t.id === value);
      if (!track) return;

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
          components: [],
        });
      }

      await interaction.editReply({
        embeds: [
          {
            description: `${client.customEmojis.loading} Loading your track...`,
            color: client.colors.embedColor.decimal,
          }
        ],
        components: [],
      });

      queue.addTrack(track);

      if (!queue.playing) await queue.play();

      await interaction.editReply({
        embeds: [
          {
            author: { name: 'Successfully added to queue', iconURL: client.customEmojisUrl.success },
            description: `Added track to queue.`,
            color: client.colors.success.decimal,
          }
        ],
        components: [],
      });
    });

    collector?.on('end', async (i,): Promise<any> => {
      await interaction.editReply({
        embeds: [embed.setFooter({ text: 'Select a song to add to the queue using the select menu below\n(time limit exceeded)' })],
        components: [new MessageActionRow().addComponents(selectMenu.setDisabled(true))],
      })
    });
  },
}