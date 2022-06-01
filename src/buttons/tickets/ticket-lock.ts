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
  name: 'ticket-lock',
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

    if (ticketDb.locked) return await interaction.editReply({
      embeds: [
        {
          author: { name: 'Ticket already locked', iconURL: client.customEmojisUrl.error },
          description: `This ticket is already locked.`,
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
              description: `${interaction.user.tag} (${interaction.user.id}) has locked the ticket <#${channel.id}>`,
              color: client.colors.embedColor.decimal,
            }
          ]
        });
      }

      await channel.permissionOverwrites.edit(ticketDb.memberId, {
        SEND_MESSAGES: false,
        VIEW_CHANNEL: true,
        READ_MESSAGE_HISTORY: true,
      });
      ticketDb.otherMembers.forEach(async (m) => await channel.permissionOverwrites.edit(m, {
        SEND_MESSAGES: false,
        VIEW_CHANNEL: true,
        READ_MESSAGE_HISTORY: true,
      }));

      ticketDb.locked = true;
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
              .setCustomId('ticket-unlock')
              .setEmoji(client.customEmojis.unlock)
              .setLabel('Unlock')
              .setStyle('SECONDARY'),
            new MessageButton()
              .setCustomId(`ticket-${ticketDb.claimed ? 'unclaim' : 'claim'}`)
              .setEmoji(ticketDb.claimed ? client.customEmojis.unclaim : client.customEmojis.claim)
              .setLabel(ticketDb.claimed ? 'Unclaim' : 'Claim')
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
            description: `This ticket is now **locked**. Only staff can send messages in this channel. However, the ticket members can still view the ticket.`,
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
              name: 'Could not lock ticket',
              iconURL: client.customEmojisUrl.error,
            },
            description: `Could not lock this ticket. Make sure I have the correct permissions.`,
            color: client.colors.error.decimal,
          }
        ]
      });
    }
  }
}
