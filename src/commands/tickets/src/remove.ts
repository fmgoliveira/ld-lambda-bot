import { Ticket } from "../../../database/models/Ticket";
import { TicketCategory } from "../../../database/models/TicketCategory";
import { ExtendedCommandInteraction } from "../../../interfaces/Command";
import ExtendedClient from "../../../structures/Client";
import { TextChannel } from 'discord.js';
import { Document } from 'mongoose';

export default async (client: ExtendedClient, interaction: ExtendedCommandInteraction, ticketDb: Document<unknown, any, Ticket> & Ticket, categoryDb: Document<unknown, any, TicketCategory> & any) => {
  const user = interaction.options.getUser('member')!;
  const channel = interaction.channel as TextChannel;

  try {
    await channel.permissionOverwrites.delete(user.id);

    if (!ticketDb.otherMembers.includes(user.id)) return await interaction.editReply({
      embeds: [
        {
          author: { name: 'User not in ticket', iconURL: client.customEmojisUrl.error },
          description: 'The specified user is not in this ticket.',
          color: client.colors.error.decimal,
        }
      ]
    });

    ticketDb.otherMembers.splice(ticketDb.otherMembers.indexOf(user.id), 1);
    await ticketDb.save();

    await interaction.editReply({
      embeds: [
        {
          author: {
            name: 'Lambda Ticket System',
            iconURL: client.customEmojisUrl.tickets,
          },
          description: `Removed <@${user.id}> from the ticket.`,
          color: client.colors.embedColor.decimal,
        }
      ]
    });
  } catch (err) {
    console.log(err);
    await interaction.editReply({
      embeds: [
        {
          author: {
            name: 'Could not remove user',
            iconURL: client.customEmojisUrl.error,
          },
          description: `Could not remove **${user.tag}** from the ticket. Make sure I have the correct permissions.`,
          color: client.colors.error.decimal,
        }
      ]
    });
  }
}