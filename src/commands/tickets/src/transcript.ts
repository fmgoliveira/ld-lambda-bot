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
  const channelToSend = interaction.options.getChannel('channel') as TextChannel | NewsChannel || interaction.user;

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
          description: `Ticket Transcript sent to ${interaction.options.getChannel('channel') ? '**<#' + channelToSend.id + '>**' : '**' + interaction.user.tag + '**'}.`,
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
          description: `Could not create a transcript for this ticket. Make sure I have the correct permissions.`,
          color: client.colors.error.decimal,
        }
      ]
    });
  }
}