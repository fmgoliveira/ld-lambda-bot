import Button from '../../interfaces/Button';
import Ticket from '../../database/models/Ticket';
import TicketCategory from '../../database/models/TicketCategory';
import { TextChannel } from 'discord.js';
import { NewsChannel } from 'discord.js';
import Guild from '../../database/models/Guild';
import { MessageAttachment } from 'discord.js';
import { createTranscript } from 'discord-html-transcripts';

export const button: Button = {
  name: 'ticket-delete',
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

    try {
      const attachment = await createTranscript(channel, {
        limit: -1,
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
              description: `${interaction.user.tag} (${interaction.user.id}) has deleted the ticket in \`#${channel.name}\``,
              color: client.colors.embedColor.decimal,
              footer: { text: 'Ticket Transcript attached below' },
            }
          ]
        });
        logMsg = await logChannel.send({ files: [attachment] });
      }

      await ticketDb.remove();

      await interaction.editReply({
        embeds: [
          {
            author: {
              name: 'Lambda Ticket System',
              iconURL: client.customEmojisUrl.tickets,
            },
            description: `This ticket will be **deleted** in 5 seconds. ${logMsg ? '[Go to transcript](' + logMsg.url + ')' : ''}`,
            color: client.colors.embedColor.decimal,
          }
        ],
      });

      setTimeout(async () => {
        await channel.delete();
      }, 5000);

    } catch (err) {
      console.log(err);
      await interaction.editReply({
        embeds: [
          {
            author: {
              name: 'Could not delete ticket',
              iconURL: client.customEmojisUrl.error,
            },
            description: `Could not delete this ticket. Make sure I have the correct permissions.`,
            color: client.colors.error.decimal,
          }
        ]
      });
    }
  }
}
