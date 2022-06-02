import Guild from "../../database/models/Guild";
import Ticket from "../../database/models/Ticket";
import TicketCategory from "../../database/models/TicketCategory";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: "ticket",
  description: 'Manage the tickets module',
  usage: [
    'ticket add <member>',
    'ticket remove <member>',
    'ticket close [delete]',
    'ticket transcript [channel]',
    'ticket reopen <ping_members>',
    'ticket delete',
    'ticket claim [lock_staff]',
    'ticket unclaim',
    'ticket lock',
    'ticket unlock',
  ],
  cooldown: 2,
  category: 'tickets',
  dmOnly: false,
  guildOnly: true,
  options: [
    {
      name: 'add',
      description: 'Add a member to the ticket',
      type: 1,
      options: [
        {
          name: 'member',
          description: 'The member to add to the ticket',
          type: 6,
          required: true,
        },
      ]
    },
    {
      name: 'remove',
      description: 'Remove a member from the ticket',
      type: 1,
      options: [
        {
          name: 'member',
          description: 'The member to remove from the ticket',
          type: 6,
          required: true,
        },
      ]
    },
    {
      name: 'close',
      description: 'Close the ticket',
      type: 1,
      options: [
        {
          name: 'delete',
          description: 'Whether to delete the ticket after closing it',
          type: 3,
          required: false,
          choices: [
            { value: 'true', name: 'Yes' },
            { value: 'false', name: 'No' },
          ],
        },
      ]
    },
    {
      name: 'transcript',
      description: 'Get the transcript of the ticket',
      type: 1,
      options: [
        {
          name: 'channel',
          description: 'The channel to send the transcript to',
          type: 7,
          channelTypes: ['GUILD_TEXT', "GUILD_NEWS"],
          required: false,
        },
      ]
    },
    {
      name: 'reopen',
      description: 'Reopen the ticket',
      type: 1,
      options: [
        {
          name: 'ping_members',
          description: 'Whether to ping the members of the ticket',
          type: 3,
          required: true,
          choices: [
            { value: 'true', name: 'Yes' },
            { value: 'false', name: 'No' },
          ],
        },
      ]
    },
    {
      name: 'delete',
      description: 'Delete the ticket',
      type: 1,
    },
    {
      name: 'claim',
      description: 'Claim the ticket',
      type: 1,
      options: [
        {
          name: 'lock_staff',
          description: 'Whether to lock the ticket for other staff not to be able to type',
          type: 3,
          required: false,
          choices: [
            { value: 'true', name: 'Yes' },
            { value: 'false', name: 'No' },
          ],
        },
      ]
    },
    {
      name: 'unclaim',
      description: 'Unclaim the ticket',
      type: 1,
    },
    {
      name: 'lock',
      description: 'Lock the ticket',
      type: 1,
    },
    {
      name: 'unlock',
      description: 'Unlock the ticket',
      type: 1,
    },
  ],

  run: async (client, interaction) => {
    const ticketsModuleDb = (await Guild.findOne({ guildId: interaction.guildId }))!.modules.tickets;

    if (!ticketsModuleDb.enabled) return await interaction.editReply({
      embeds: [
        {
          author: { name: 'Module Disabled', iconURL: client.customEmojisUrl.error },
          description: 'The tickets module is disabled on this server. You can enable it in the online dashboard.',
          color: client.colors.error.decimal,
        }
      ]
    });

    const subCommand = interaction.options.getSubcommand() as 'add' | 'remove' | 'close' | 'transcript' | 'reopen' | 'delete' | 'claim' | 'unclaim' | 'lock' | 'unlock';
    const ticketDb = await Ticket.findOne({ guildId: interaction.guildId!, channelId: interaction.channelId! });

    if (!ticketDb) return await interaction.editReply({
      embeds: [
        {
          author: { name: 'No ticket found', iconURL: client.customEmojisUrl.error },
          description: 'This channel is not a ticket channel. Please head over to one and try again.',
          color: client.colors.error.decimal,
        }
      ]
    });

    const categoryDb = await TicketCategory.findById(ticketDb.category);
    if (!categoryDb) return await interaction.editReply({
      embeds: [
        {
          author: { name: 'Ticket Category not found', iconURL: client.customEmojisUrl.error },
          description: 'This ticket is not registered in a category, in our database. Please contact the staff team for help.',
          color: client.colors.error.decimal,
        }
      ]
    });

    const staffRoles = categoryDb.supportRoles;
    if (subCommand !== 'close' && !interaction.member.roles.cache.some(r => staffRoles.includes(r.id))) return interaction.editReply({
      embeds: [
        {
          author: { name: 'You do not have permission to do this', iconURL: client.customEmojisUrl.error },
          description: 'You do not have permission to do this. This command is only allowed to be used by the ticket responsible staff team.',
          color: client.colors.error.decimal,
        }
      ]
    });

    const cmd = await import(`./src/${subCommand}`);
    cmd(client, interaction, ticketDb, categoryDb);
  },
}
