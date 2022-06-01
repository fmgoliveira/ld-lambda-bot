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

export default async (client: ExtendedClient, interaction: ExtendedCommandInteraction, ticketDb: Document<unknown, any, Ticket> & Ticket, categoryDb: Document<unknown, any, TicketCategory> & TicketCategory) => {
  const channel = interaction.channel as TextChannel;

  if (!ticketDb.claimed || !ticketDb.claimedBy) return await interaction.editReply({
    embeds: [
      {
        author: { name: 'Ticket not claimed', iconURL: client.customEmojisUrl.error },
        description: `This ticket is not claimed.`,
        color: client.colors.error.decimal,
      }
    ],
  });

  if (ticketDb.claimedBy !== interaction.user.id) return await interaction.editReply({
    embeds: [
      {
        author: { name: 'Forbidden action', iconURL: client.customEmojisUrl.error },
        description: `You can't unclaim this ticket as you were not the one who claimed it.`,
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
            description: `${interaction.user.tag} (${interaction.user.id}) has unclaimed the ticket <#${channel.id}>`,
            color: client.colors.embedColor.decimal,
          }
        ]
      });
    }

    categoryDb.supportRoles.forEach(async (r) => await channel.permissionOverwrites.edit(r, {
      SEND_MESSAGES: true,
      VIEW_CHANNEL: true,
      READ_MESSAGE_HISTORY: true,
    }));

    ticketDb.lockStaff = false;

    ticketDb.claimed = false;
    ticketDb.claimedBy = '';
    await ticketDb.save();

    const message = await channel.messages.fetch(ticketDb.messageId);
    if (message && message.editable) await message.edit({
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId(`ticket-close`)
            .setEmoji(client.customEmojis.close)
            .setLabel('Close')
            .setStyle('SECONDARY'),
          new MessageButton()
            .setCustomId(`ticket-${ticketDb.locked ? 'unlock' : 'lock'}`)
            .setEmoji(ticketDb.locked ? client.customEmojis.unlock : client.customEmojis.lock)
            .setLabel(ticketDb.locked ? 'Unlock' : 'Lock')
            .setStyle('SECONDARY'),
          new MessageButton()
            .setCustomId('ticket-claim')
            .setEmoji(client.customEmojis.claim)
            .setLabel('Claim')
            .setStyle('SECONDARY'),
        )
      ]
    });

    await interaction.editReply({
      embeds: [
        {
          author: {
            name: 'Lambda Ticket System',
            iconURL: client.customEmojisUrl.tickets,
          },
          description: `This ticket is now **unclaimed**.`,
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
            name: 'Could not unclaim ticket',
            iconURL: client.customEmojisUrl.error,
          },
          description: `Could not unclaim this ticket. Make sure I have the correct permissions.`,
          color: client.colors.error.decimal,
        }
      ]
    });
  }
}