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
    await channel.permissionOverwrites.edit(user.id, {
      SEND_MESSAGES: true,
      VIEW_CHANNEL: true,
      READ_MESSAGE_HISTORY: true,
    });

    if (ticketDb.otherMembers.includes(user.id)) return await interaction.editReply({
      embeds: [
        {
          author: { name: 'User already in ticket', iconURL: client.customEmojisUrl.error },
          description: 'The specified user is already in this ticket.',
          color: client.colors.error.decimal,
        }
      ]
    });

    ticketDb.otherMembers.push(user.id);
    await ticketDb.save();

    await interaction.editReply({
      embeds: [
        {
          author: {
            name: 'Lambda Ticket System',
            iconURL: client.customEmojisUrl.tickets,
          },
          description: `Added <@${user.id}> to the ticket.`,
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
            name: 'Could not add user',
            iconURL: client.customEmojisUrl.error,
          },
          description: `Could not add **${user.tag}** to the ticket. Make sure I have the correct permissions.`,
          color: client.colors.error.decimal,
        }
      ]
    });
  }
}