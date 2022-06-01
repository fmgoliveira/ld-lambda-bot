import Button from '../../interfaces/Button';
import Ticket from '../../database/models/Ticket';
import TicketCategory from '../../database/models/TicketCategory';
import { TextChannel } from 'discord.js';
import { NewsChannel } from 'discord.js';
import Guild from '../../database/models/Guild';
import { MessageAttachment } from 'discord.js';
import { createTranscript } from 'discord-html-transcripts';

export const button: Button = {
  name: 'ticket-transcript',
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
    const channelToSend = interaction.user;

    try {
      const attachment = await createTranscript(channel, {
        limit: -1,
        returnType: 'attachment',
        fileName: `${channel.name}_transcript.html`
      }) as MessageAttachment;

      const logChannelId = (await Guild.findOne({ guildId: interaction.guildId }))!.modules.tickets.logChannel;
      const logChannel = interaction.guild!.channels.cache.get(logChannelId) as TextChannel | NewsChannel | undefined;
      if (logChannel) {
        await logChannel.send({
          embeds: [
            {
              author: { name: 'Lambda Ticket System', iconURL: client.customEmojisUrl.tickets },
              description: `${interaction.user.tag} (${interaction.user.id}) has created a transcript for the ticket <#${channel.id}>`,
              color: client.colors.embedColor.decimal,
            }
          ]
        });
      }

      await channelToSend.send({
        content: `Here is the transcript for the ticket <#${channel.id}>`,
        attachments: [attachment],
      });

      await interaction.editReply({
        embeds: [
          {
            author: {
              name: 'Lambda Ticket System',
              iconURL: client.customEmojisUrl.tickets,
            },
            description: `Ticket Transcript sent to you via DM.`,
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
              name: 'Could not create transcript',
              iconURL: client.customEmojisUrl.error,
            },
            description: `Could not create a transcript for this ticket. Make sure you have your DMs opened.`,
            color: client.colors.error.decimal,
          }
        ]
      });
    }
  }
}
