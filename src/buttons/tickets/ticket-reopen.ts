import Button from '../../interfaces/Button';
import Ticket from '../../database/models/Ticket';
import TicketCategory from '../../database/models/TicketCategory';
import { TextChannel } from 'discord.js';
import { NewsChannel } from 'discord.js';
import Guild from '../../database/models/Guild';
import { Message } from 'discord.js';

export const button: Button = {
  name: 'ticket-reopen',
  ephemeralReply: true,
  reply: true,

  run: async (client, interaction) => {
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
    if (!interaction.member.roles.cache.some(r => staffRoles.includes(r.id))) return interaction.editReply({
      embeds: [
        {
          author: { name: 'You do not have permission to do this', iconURL: client.customEmojisUrl.error },
          description: 'You do not have permission to do this. This command is only allowed to be used by the ticket responsible staff team.',
          color: client.colors.error.decimal,
        }
      ]
    });

    const channel = interaction.channel as TextChannel;

    if (!ticketDb.closed) return await interaction.editReply({
      embeds: [
        {
          author: { name: 'Ticket not closed', iconURL: client.customEmojisUrl.error },
          description: 'This ticket channel is not already closed.',
          color: client.colors.error.decimal,
        }
      ],
    });

    try {
      const logChannelId = (await Guild.findOne({ guildId: interaction.guildId }))!.modules.tickets.logChannel;
      const logChannel = interaction.guild!.channels.cache.get(logChannelId) as TextChannel | NewsChannel | undefined;
      if (logChannel) {
        await logChannel.send({
          embeds: [
            {
              author: { name: 'Lambda Ticket System', iconURL: client.customEmojisUrl.tickets },
              description: `${interaction.user.tag} (${interaction.user.id}) has re-opened the ticket <#${channel.id}>`,
              color: client.colors.embedColor.decimal,
            }
          ]
        });
      }

      await channel.permissionOverwrites.edit(ticketDb.memberId, {
        SEND_MESSAGES: true,
        VIEW_CHANNEL: true,
        READ_MESSAGE_HISTORY: true,
      });
      ticketDb.otherMembers.forEach(async (m) => await channel.permissionOverwrites.edit(m, {
        SEND_MESSAGES: true,
        VIEW_CHANNEL: true,
        READ_MESSAGE_HISTORY: true,
      }));

      ticketDb.closed = false;
      await ticketDb.save();

      const msg = await channel.send({
        content: `<@${ticketDb.memberId}> ${ticketDb.otherMembers.map((m) => `<@${m}>`).join(' ')}`,
      });
      setTimeout(async () => await msg.delete().catch(() => { }), 1500);

      await (interaction.message as Message).delete().catch(() => { });

      await interaction.editReply({
        embeds: [
          {
            author: {
              name: 'Lambda Ticket System',
              iconURL: client.customEmojisUrl.tickets,
            },
            description: `This ticket is now **opened**.`,
            color: client.colors.embedColor.decimal,
          }
        ],
      });
    } catch (err) {
      console.log(err);
      await interaction.editReply({
        embeds: [
          {
            author: {
              name: 'Could not re-open ticket',
              iconURL: client.customEmojisUrl.error,
            },
            description: `Could not re-open this ticket. Make sure I have the correct permissions.`,
            color: client.colors.error.decimal,
          }
        ]
      });
    }
  }
}
