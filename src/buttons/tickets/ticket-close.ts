import Button from '../../interfaces/Button';
import Ticket from '../../database/models/Ticket';
import TicketCategory from '../../database/models/TicketCategory';
import { TextChannel } from 'discord.js';
import { NewsChannel } from 'discord.js';
import Guild from '../../database/models/Guild';
import { MessageButton } from 'discord.js';
import { MessageActionRow } from 'discord.js';
import { CategoryChannel } from 'discord.js';
import { MessageAttachment } from 'discord.js';
import { createTranscript } from 'discord-html-transcripts';

export const button: Button = {
  name: 'ticket-close',
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

    if (ticketDb.closed) return await interaction.editReply({
      embeds: [
        {
          author: { name: 'Ticket already closed', iconURL: client.customEmojisUrl.error },
          description: 'This ticket channel is already closed.',
          color: client.colors.error.decimal,
        }
      ],
    });

    if (categoryDb.deleteOnClose) {
      return await interaction.editReply({
        embeds: [
          {
            author: {
              name: 'Lambda Ticket System',
              iconURL: client.customEmojisUrl.tickets,
            },
            description: `Are you sure you want to close this ticket? If you do so, this ticket channel will be deleted.`,
            color: client.colors.embedColor.decimal,
          }
        ],
        components: [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setLabel('Close & Delete')
              .setCustomId('ticket-delete')
              .setEmoji(client.customEmojis.delete)
              .setStyle('SECONDARY'),
            new MessageButton()
              .setLabel('Cancel')
              .setCustomId('ticket-deleteMessage')
              .setStyle('SECONDARY')
          )
        ]
      })
    }

    try {
      const attachment = await createTranscript(channel, {
        limit: -1,
        returnType: 'attachment',
        fileName: `${channel.name}_transcript.html`
      }) as MessageAttachment;

      const logChannelId = (await Guild.findOne({ guildId: interaction.guildId }))!.modules.tickets.logChannel;
      const logChannel = interaction.guild!.channels.cache.get(logChannelId) as TextChannel | NewsChannel | undefined;
      let logMsg;
      if (logChannel) {
        await logChannel.send({
          embeds: [
            {
              author: { name: 'Lambda Ticket System', iconURL: client.customEmojisUrl.tickets },
              description: `${interaction.user.tag} (${interaction.user.id}) has ${categoryDb.deleteOnClose ? 'deleted' : 'closed'} the ticket in \`#${channel.name}\``,
              color: client.colors.embedColor.decimal,
              footer: { text: 'Ticket Transcript attached below' },
            }
          ]
        });
        logMsg = await logChannel.send({ attachments: [attachment] });
      }

      await channel.permissionOverwrites.delete(ticketDb.memberId);
      ticketDb.otherMembers.forEach(async (m) => await channel.permissionOverwrites.delete(m));

      ticketDb.closed = true;
      await ticketDb.save();

      if (categoryDb.moveToClosedCategory) {
        const closedCatId = (await Guild.findOne({ guildId: interaction.guildId }))!.modules.tickets.closedCategory;
        if (closedCatId) {
          const closedCategory = interaction.guild!.channels.cache.get(closedCatId) as CategoryChannel | undefined;
          if (closedCategory) await channel.setParent(closedCategory).catch(() => { });
        }
      }

      await channel.send({
        embeds: [
          {
            author: {
              name: 'Lambda Ticket System',
              iconURL: client.customEmojisUrl.tickets,
            },
            description: `This ticket is now **closed**. ${logMsg ? '[Go to transcript](' + logMsg.url + ')' : ''}`,
            color: client.colors.embedColor.decimal,
          }
        ],
        components: [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setLabel('Delete')
              .setCustomId('ticket-delete')
              .setEmoji(client.customEmojis.delete)
              .setStyle('SECONDARY'),
            new MessageButton()
              .setLabel('Re-open')
              .setCustomId('ticket-reopen')
              .setEmoji(client.customEmojis.unlock)
              .setStyle('SECONDARY'),
            new MessageButton()
              .setLabel('Create Transcript')
              .setCustomId('ticket-transcript')
              .setEmoji(client.customEmojis.transcript)
              .setStyle('SECONDARY'),
          )
        ]
      }).then((msg) => msg.pin().catch(() => { }));

      await interaction.editReply({
        embeds: [
          {
            author: {
              name: 'Closed ticket',
              iconURL: client.customEmojisUrl.success,
            },
            description: `This ticket is now **closed**.`,
            color: client.colors.success.decimal,
          }
        ],
      })
    } catch (err) {
      console.log(err);
      await interaction.editReply({
        embeds: [
          {
            author: {
              name: 'Could not close ticket',
              iconURL: client.customEmojisUrl.error,
            },
            description: `Could not close this ticket. Make sure I have the correct permissions.`,
            color: client.colors.error.decimal,
          }
        ]
      });
    }
  }
}
