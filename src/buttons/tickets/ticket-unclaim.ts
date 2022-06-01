import Button from '../../interfaces/Button';
import Ticket from '../../database/models/Ticket';
import TicketCategory from '../../database/models/TicketCategory';
import { TextChannel } from 'discord.js';
import { NewsChannel } from 'discord.js';
import { MessageActionRow } from 'discord.js';
import { MessageButton } from 'discord.js';
import { Message } from 'discord.js';
import Guild from '../../database/models/Guild';

export const button: Button = {
  name: 'ticket-unclaim',
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

      await (interaction.message as Message).edit({
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
}
