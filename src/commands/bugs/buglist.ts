import { MessageEmbedAuthor } from "discord.js";
import { MessageEmbed } from "discord.js";
import Bug from "../../database/models/Bug";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: 'buglist',
  description: 'List all the reported bugs',
  guildOnly: false,
  dmOnly: false,
  category: 'bugs',
  ephemeralReply: true,
  usage: ['buglist [user] [status]'],
  options: [
    {
      name: 'user',
      description: 'Filter by user',
      type: 6,
      required: false,
    },
    {
      name: 'status',
      description: 'Filter by status',
      type: 3,
      required: false,
      choices: [
        { value: 'reported', name: 'Reported' },
        { value: 'resolved', name: 'Resolved' },
        { value: 'in-progress', name: 'In Progress' },
        { value: 'rejected', name: 'Rejected' },
      ]
    }
  ],

  run: async (client, interaction) => {
    const user = interaction.options.getUser('user');
    const status = interaction.options.getString('status');

    let bugList;
    if (user) {
      if (status) bugList = await Bug.find({ userId: user.id, status })
      else bugList = await Bug.find({ userId: user.id })
    } else if (status) bugList = await Bug.find({ status })
    else bugList = await Bug.find();

    if (bugList.length === 0) {
      if (user) return await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: `${user.username}'s Bug Reports List`,
              iconURL: user.displayAvatarURL({ dynamic: true }),
            } as MessageEmbedAuthor)
            .setDescription(`${user.tag} has not reported any bugs yet.`)
            .setColor(client.colors.embedColor.decimal)
        ],
      });
      else if (status) return await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: 'Bug Reports List',
              iconURL: client.user!.displayAvatarURL({ dynamic: true }),
            } as MessageEmbedAuthor)
            .setDescription('There are no reported bugs yet with the status you specified.')
            .setColor(client.colors.embedColor.decimal)
        ],
      });
      else return await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: 'Bug Reports List',
              iconURL: client.user!.displayAvatarURL({ dynamic: true }),
            } as MessageEmbedAuthor)
            .setDescription('There are no reported bugs yet.')
            .setColor(client.colors.embedColor.decimal)
        ],
      });
    }

    const formatStatus = (status: string) => {
      switch (status) {
        case 'reported':
          return `${client.customEmojis.reported} - *Reported*`;
        case 'inprogress':
          return `${client.customEmojis.inProgress} - *In Progress*`;
        case 'resolved':
          return `${client.customEmojis.success} - *Resolved*`;
        case 'rejected':
          return `${client.customEmojis.rejected} - *Rejected*`;
        default:
          return 'Unknown';
      }
    };

    const embed = new MessageEmbed()
      .setAuthor({
        name: user ? `${user.username}'s Bug Reports List` : status ? `${status.split('-').join(' ')[0].toUpperCase() + status.split('-').join(' ').slice(1, status.length)} Bug Reports List` : 'Bug Reports List',
        iconURL: user ? user.displayAvatarURL({ dynamic: true }) : client.user!.displayAvatarURL({ dynamic: true }),
      } as MessageEmbedAuthor)
      .setColor(client.colors.embedColor.decimal)
      .setDescription(bugList.map((bug) => `**• Report #${bug.bugId}:** ${bug.title} | ${formatStatus(bug.status)}`).join('\n').substring(0, 4096))
      .setFooter({ text: 'Report a bug with the `/bugreport` command.' });

    await interaction.editReply({
      embeds: [embed],
    });
  }
}