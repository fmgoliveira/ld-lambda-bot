import { Ticket } from "../../../database/models/Ticket";
import { TicketCategory } from "../../../database/models/TicketCategory";
import { ExtendedCommandInteraction } from "../../../interfaces/Command";
import ExtendedClient from "../../../structures/Client";
import { TextChannel } from 'discord.js';
import { Document } from 'mongoose';
import Guild from "../../../database/models/Guild";
import { NewsChannel } from "discord.js";
import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";
import { createTranscript } from 'discord-html-transcripts';
import { MessageAttachment } from "discord.js";
import { Message } from "discord.js";

export default async (client: ExtendedClient, interaction: ExtendedCommandInteraction, ticketDb: Document<unknown, any, Ticket> & Ticket, categoryDb: Document<unknown, any, TicketCategory> & TicketCategory) => {
  const pingMembers = interaction.options.getString('ping_members') === 'true' ? true : false;
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
    let logMsg;
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

    if (pingMembers) {
      const msg = await channel.send({
        content: `<@${ticketDb.memberId}> ${ticketDb.otherMembers.map((m) => `<@${m}>`).join(' ')}`,
      });
      setTimeout(async () => await msg.delete().catch(() => { }), 3000);
    }

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