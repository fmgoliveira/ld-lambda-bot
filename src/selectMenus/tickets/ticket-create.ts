import { NewsChannel } from "discord.js";
import { MessageActionRow } from "discord.js";
import { OverwriteResolvable } from "discord.js";
import { CategoryChannel } from "discord.js";
import { MessageButton } from "discord.js";
import { ColorResolvable, MessageEmbed, TextChannel } from "discord.js";
import Guild from "../../database/models/Guild";
import Ticket from "../../database/models/Ticket";
import TicketCategory from "../../database/models/TicketCategory";
import SelectMenu from "../../interfaces/SelectMenu";
import placeholderReplace from "../../utils/placeholderReplace";

export const selectMenu: SelectMenu = {
  name: 'ticket-create',
  ephemeralReply: true,
  reply: true,

  run: async (client, interaction) => {
    const guildDb = await Guild.findOne({ guildId: interaction.guildId });
    if (!guildDb || !guildDb.modules.tickets.enabled) return interaction.editReply({
      embeds: [
        {
          author: { name: 'Module Disabled', iconURL: client.customEmojisUrl.error },
          description: 'The tickets module is disabled on this server. You can enable it in the online dashboard.',
          color: client.colors.error.decimal,
        }
      ]
    });

    if ((await TicketCategory.find({ guildId: interaction.guildId })).length === 0) return interaction.editReply({
      embeds: [
        {
          author: { name: 'Category not found', iconURL: client.customEmojisUrl.error },
          description: 'This server has no ticket categories set in the dashboard.',
          color: client.colors.error.decimal,
        }
      ]
    });


    const category = interaction.values[0];
    const categoryDb = await TicketCategory.findOne({ id: category });
    console.log(category);

    if (!categoryDb) return await interaction.editReply({
      embeds: [
        {
          author: { name: 'Could not create ticket', icon_url: client.customEmojisUrl.error },
          description: 'An error occured while creating your ticket. Please try again later.\n\n> \`\`\`The specified ticket category does not exist in the database.\`\`\`',
          color: client.colors.error.decimal
        }
      ]
    });

    if (!categoryDb) return await interaction.editReply({
      embeds: [
        {
          author: { name: 'Could not create ticket', icon_url: client.customEmojisUrl.error },
          description: 'An error occured while creating your ticket. Please try again later.\n\n> \`\`\`The specified ticket category does not exist in the database.\`\`\`',
          color: client.colors.error.decimal
        }
      ]
    });

    if (categoryDb.maxTickets > 0 && (await Ticket.find({ guildId: interaction.guildId, memberId: interaction.user.id, category: String(categoryDb._id) })).length >= categoryDb.maxTickets) return await interaction.editReply({
      embeds: [
        {
          author: { name: 'Could not create ticket', icon_url: client.customEmojisUrl.error },
          description: 'An error occured while creating your ticket. Please try again later.\n\n> \`\`\`You have reached the maximum amount of open tickets for this category.\`\`\`',
          color: client.colors.error.decimal
        }
      ]
    });

    const categoryChannel = categoryDb.categoryChannel
    if (categoryChannel) {
      if (!interaction.guild!.me?.permissionsIn(categoryChannel).has('MANAGE_CHANNELS')) return await interaction.editReply({
        embeds: [
          {
            author: { name: 'Could not create ticket', icon_url: client.customEmojisUrl.error },
            description: 'An error occured while creating your ticket. Please try again later.\n\n> \`\`\`I do not have permissions in the ticket category channel.\`\`\`',
            color: client.colors.error.decimal
          }
        ]
      });

      const catChannel = interaction.guild!.channels.cache.get(categoryChannel) as CategoryChannel | undefined;
      if (catChannel) await catChannel.createChannel(`ticket-${guildDb.modules.tickets.ticketCount ? guildDb.modules.tickets.ticketCount + 1 : 1}`, {
        type: 'GUILD_TEXT',
        permissionOverwrites: [
          {
            id: interaction.user.id,
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
          },
          {
            id: interaction.guild!.id,
            deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
          },
          ...categoryDb.supportRoles.map(role => ({ id: role, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'] }) as OverwriteResolvable),
          {
            id: client.user!.id,
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'MANAGE_MESSAGES', 'ATTACH_FILES'],
          },
        ]
      }).then(async (channel) => {
        guildDb.modules.tickets.ticketCount++;
        await guildDb.save();

        const ticketDb = new Ticket({
          guildId: interaction.guildId,
          memberId: interaction.user.id,
          category: categoryDb!._id,
          channelId: channel.id,
          claimed: false,
          claimedBy: '',
          closed: false,
          lockStaff: false,
          locked: false,
          ticketId: guildDb.modules.tickets.ticketCount,
        });

        const logChannelId = guildDb.modules.tickets.logChannel;
        if (logChannelId) {
          const logChannel = interaction.guild!.channels.cache.get(logChannelId) as TextChannel | NewsChannel | undefined;
          if (logChannel) {
            await logChannel.send({
              embeds: [
                {
                  author: { name: 'Lambda Ticket System', iconURL: client.customEmojisUrl.tickets },
                  description: `${interaction.user.tag} (${interaction.user.id}) has created a ticket in <#${channel.id}>`,
                  color: client.colors.embedColor.decimal,
                }
              ]
            });
          }
        }

        const welcomeEmbed = new MessageEmbed()
          .setAuthor({ name: `${interaction.guild!.name} | Ticketing System`.substring(0, 256), iconURL: interaction.guild!.iconURL() || undefined })
          .setTitle(`Ticket for ${interaction.user.username} - ${categoryDb.label}`.substring(0, 256))
          .setDescription(placeholderReplace(categoryDb.welcomeMessage.message, interaction.guild!, interaction.user))
          .setTimestamp()
          .setColor(categoryDb.welcomeMessage.color as ColorResolvable);
        const buttons = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId('ticket-close')
            .setEmoji(client.customEmojis.close)
            .setLabel('Close')
            .setStyle('SECONDARY'),
          new MessageButton()
            .setCustomId('ticket-lock')
            .setEmoji(client.customEmojis.lock)
            .setLabel('Lock')
            .setStyle('SECONDARY'),
          new MessageButton()
            .setCustomId('ticket-claim')
            .setEmoji(client.customEmojis.claim)
            .setLabel('Claim')
            .setStyle('SECONDARY'),
        );

        await channel.send({ embeds: [welcomeEmbed], components: [buttons] }).then(msg => msg.pin());

        channel.send({ content: `${categoryDb.supportRoles.map(role => `<@&${role}>`).join(' ')}, <@${interaction.user.id}> created a ticket` }).then(msg => {
          setTimeout(() => msg.delete().catch(() => { }), 1500);
        }).catch(err => console.log(err));

        await ticketDb.save();

        await interaction.editReply({
          content: `Your ticket has been created in <#${channel.id}>.`,
        });
      }).catch(async (err) => {
        console.log(err);

        await interaction.editReply({
          embeds: [
            {
              author: { name: 'Could not create ticket', icon_url: client.customEmojisUrl.error },
              description: 'An error occured while creating your ticket. Please try again later.\n\n> \`\`\` Could not create the ticket channel. Make sure I have the proper permissions. \`\`\`',
              color: client.colors.error.decimal
            }
          ]
        });
      });
    } else {
      if (!interaction.guild!.me?.permissions.has('MANAGE_CHANNELS')) return await interaction.editReply({
        embeds: [
          {
            author: { name: 'Could not create ticket', icon_url: client.customEmojisUrl.error },
            description: 'An error occured while creating your ticket. Please try again later.\n\n> \`\`\`I do not have permissions.\`\`\`',
            color: client.colors.error.decimal
          }
        ]
      });

      await interaction.guild!.channels.create(`ticket-${guildDb.modules.tickets.ticketCount ? guildDb.modules.tickets.ticketCount + 1 : 1}`, {
        type: 'GUILD_TEXT',
        permissionOverwrites: [
          {
            id: interaction.user.id,
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
          },
          {
            id: interaction.guild!.id,
            deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
          },
          ...categoryDb.supportRoles.map(role => ({ id: role, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'] }) as OverwriteResolvable),
          {
            id: client.user!.id,
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'MANAGE_MESSAGES', 'ATTACH_FILES'],
          },
        ]
      }).then(async (channel) => {
        guildDb.modules.tickets.ticketCount++;
        await guildDb.save();

        const ticketDb = new Ticket({
          guildId: interaction.guildId,
          memberId: interaction.user.id,
          category: categoryDb!._id,
          channelId: channel.id,
          claimed: false,
          claimedBy: '',
          closed: false,
          lockStaff: false,
          locked: false,
          ticketId: guildDb.modules.tickets.ticketCount,
        });

        const logChannelId = guildDb.modules.tickets.logChannel;
        if (logChannelId) {
          const logChannel = interaction.guild!.channels.cache.get(logChannelId) as TextChannel | NewsChannel | undefined;
          if (logChannel) {
            await logChannel.send({
              embeds: [
                {
                  author: { name: 'Lambda Ticket System', iconURL: client.customEmojisUrl.tickets },
                  description: `${interaction.user.tag} (${interaction.user.id}) has created a ticket in <#${channel.id}>`,
                  color: client.colors.embedColor.decimal,
                }
              ]
            });
          }
        }

        const welcomeEmbed = new MessageEmbed()
          .setAuthor({ name: `${interaction.guild!.name} | Ticketing System`.substring(0, 256), iconURL: interaction.guild!.iconURL() || undefined })
          .setTitle(`Ticket for ${interaction.user.username} - ${categoryDb.label}`.substring(0, 256))
          .setDescription(placeholderReplace(categoryDb.welcomeMessage.message, interaction.guild!, interaction.user))
          .setTimestamp()
          .setColor(categoryDb.welcomeMessage.color as ColorResolvable);
        const buttons = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId('ticket-close')
            .setEmoji(client.customEmojis.close)
            .setLabel('Close')
            .setStyle('SECONDARY'),
          new MessageButton()
            .setCustomId('ticket-lock')
            .setEmoji(client.customEmojis.lock)
            .setLabel('Lock')
            .setStyle('SECONDARY'),
          new MessageButton()
            .setCustomId('ticket-claim')
            .setEmoji(client.customEmojis.claim)
            .setLabel('Claim')
            .setStyle('SECONDARY'),
        );

        await channel.send({ embeds: [welcomeEmbed], components: [buttons] }).then(msg => msg.pin());

        channel.send({ content: `${categoryDb.supportRoles.map(role => `<@&${role}>`).join(' ')}, <@${interaction.user.id}> created a ticket` }).then(msg => {
          setTimeout(() => msg.delete().catch(() => { }), 1500);
        }).catch(err => console.log(err));

        await ticketDb.save();

        await interaction.editReply({
          content: `Your ticket has been created in <#${channel.id}>.`,
        });
      }).catch(async (err) => {
        console.log(err);

        await interaction.editReply({
          embeds: [
            {
              author: { name: 'Could not create ticket', icon_url: client.customEmojisUrl.error },
              description: 'An error occured while creating your ticket. Please try again later.\n\n> \`\`\` Could not create the ticket channel. Make sure I have the proper permissions. \`\`\`',
              color: client.colors.error.decimal
            }
          ]
        });
      });
    }

  },
}