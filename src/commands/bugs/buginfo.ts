import { MessageEmbedAuthor } from "discord.js";
import { MessageEmbed } from "discord.js";
import Bug from "../../database/models/Bug";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: 'buginfo',
  description: 'Get info on a specific bug',
  guildOnly: false,
  dmOnly: false,
  category: 'bugs',
  ephemeralReply: true,
  usage: ['buginfo <bug id>'],
  options: [
    {
      name: 'bug_id',
      description: 'The ID of the bug you want to get info on',
      type: 4,
      minValue: 1,
      required: true,
    }
  ],

  run: async (client, interaction) => {
    const id = interaction.options.getInteger('bug_id');

    const bug = await Bug.findOne({ bugId: id });

    if (!bug) {
      return await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: 'Bug Report Not Found',
              iconURL: client.customEmojisUrl.error,
            } as MessageEmbedAuthor)
            .setDescription('The bug you are looking for does not exist. Use the `/buglist` command to see all bugs and their IDs.')
            .setColor(client.colors.error.decimal)
        ],
      });
    }

    const formatStatus = (status: string) => {
      switch (status) {
        case 'reported':
          return `${client.customEmojis.reported} | Reported`;
        case 'inprogress':
          return `${client.customEmojis.inProgress} | In Progress`;
        case 'resolved':
          return `${client.customEmojis.success} | Resolved`;
        case 'rejected':
          return `${client.customEmojis.rejected} | Rejected`;
        default:
          return 'Unknown';
      }
    };

    const embed = new MessageEmbed()
      .setTitle(`Bug Report #${bug.bugId}`)
      .setDescription(bug.title)
      .addFields([
        {
          name: 'Report Description',
          value: bug.description || 'No description provided.',
        },
        {
          name: 'Steps to Reproduce',
          value: bug.steps,
        },
        {
          name: 'Expected Behavior',
          value: bug.expected,
        },
        {
          name: 'Actual Behavior',
          value: bug.actual,
        },
        {
          name: 'Report Status',
          value: formatStatus(bug.status),
        }
      ])
      .setColor(client.colors.embedColor.decimal)
      .setFooter({ text: 'Report a bug with the `/bugreport` command.\nCheck the reported bugs list with `/buglist [user]`.' });

    await interaction.editReply({
      embeds: [embed],
    });
  }
}