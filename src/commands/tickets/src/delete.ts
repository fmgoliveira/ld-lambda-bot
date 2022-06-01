import { Ticket } from "../../../database/models/Ticket";
import { TicketCategory } from "../../../database/models/TicketCategory";
import { ExtendedCommandInteraction } from "../../../interfaces/Command";
import ExtendedClient from "../../../structures/Client";
import { TextChannel } from 'discord.js';
import { Document } from 'mongoose';
import Guild from "../../../database/models/Guild";
import { NewsChannel } from "discord.js";
import { createTranscript } from 'discord-html-transcripts';
import { MessageAttachment } from "discord.js";

export default async (client: ExtendedClient, interaction: ExtendedCommandInteraction, ticketDb: Document<unknown, any, Ticket> & Ticket, categoryDb: Document<unknown, any, TicketCategory> & TicketCategory) => {
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