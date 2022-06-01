import { MessageActionRow } from "discord.js";
import { NewsChannel } from "discord.js";
import { MessageButton } from "discord.js";
import { TextChannel } from "discord.js";
import ms from "ms";
import User from "../../database/models/User";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: "giveaway",
  description: "Manage the giveaways",
  guildOnly: true,
  dmOnly: false,
  category: "admin",
  ephemeralReply: true,
  userPermissions: ["MANAGE_GUILD"],
  cooldown: 10,
  staffOnly: true,
  usage: [
    "giveaway start <duration> <winners> <prize> [channel] [hostedBy] [drop]",
    "giveaway <end|pause|resume|reroll|delete> <message_id>",
  ],
  options: [
    {
      name: "start",
      type: 1,
      description: "Start a giveaway",
      options: [
        {
          name: "duration",
          description: "The duration of the giveaway (1d, 1h, 1m, ...)",
          type: 3,
          required: true,
        },
        {
          name: "winners",
          description: "The number of winners",
          type: 4,
          minValue: 1,
          maxValue: 100,
          required: true,
        },
        {
          name: "prize",
          description: "The prize of the giveaway",
          type: 3,
          required: true,
        },
        {
          name: "channel",
          description: "The channel to send the giveaway in",
          type: 7,
          channelTypes: ["GUILD_TEXT", "GUILD_NEWS"],
          required: false,
        },
        {
          name: "hosted_by",
          description: "The user that hosted the giveaway",
          type: 6,
          required: false,
        },
        {
          name: "drop",
          description: "If the giveaway should end when the amount of winners is reached",
          type: 5,
          required: false,
        },
      ],
    },
    {
      name: "end",
      type: 1,
      description: "End a giveaway",
      options: [
        {
          name: "message_id",
          type: 3,
          description: "The id of the giveaway message",
          required: true,
        },
      ],
    },
    {
      name: "pause",
      type: 1,
      description: "Pause a giveaway",
      options: [
        {
          name: "message_id",
          type: 3,
          description: "The id of the giveaway message",
          required: true,
        },
      ],
    },
    {
      name: "resume",
      type: 1,
      description: "Resume a giveaway",
      options: [
        {
          name: "message_id",
          type: 3,
          description: "The id of the giveaway message",
          required: true,
        },
      ],
    },
    {
      name: "reroll",
      type: 1,
      description: "Reroll a giveaway",
      options: [
        {
          name: "message_id",
          type: 3,
          description: "The id of the giveaway message",
          required: true,
        },
      ],
    },
    {
      name: "delete",
      type: 1,
      description: "Delete a giveaway from the database",
      options: [
        {
          name: "message_id",
          type: 3,
          description: "The id of the giveaway message",
          required: true,
        },
      ],
    }
  ],

  run: async (client, interaction) => {
    const subCommand = interaction.options.getSubcommand();
    const giveaway = client.giveawaysManager.giveaways.find((g) => g.guildId === interaction.guild!.id && g.messageId === interaction.options.getString('message_id'));

    if (subCommand !== 'start' && !giveaway) return await interaction.editReply({
      embeds: [{
        author: {
          name: "Giveaway not found",
          icon_url: client.customEmojisUrl.error,
        },
        color: client.colors.error.decimal,
        description: "The giveaway with the ID you specified doesn't exist",
      }],
    });

    switch (subCommand) {
      case 'start': {
        const gChannel = interaction.options.getChannel('channel') as TextChannel | NewsChannel || interaction.channel;
        const viewChannel = interaction.guild?.me?.permissionsIn(gChannel).has('VIEW_CHANNEL') ?? false;
        const sendMessages = interaction.guild?.me?.permissionsIn(gChannel).has('SEND_MESSAGES') ?? false;

        if (!viewChannel || !sendMessages) {
          return await interaction.editReply({
            embeds: [{
              author: {
                name: 'No permissions',
                iconURL: client.customEmojisUrl.error,
              },
              description: `I don't have the permissions to send/edit messages in <#${gChannel.id}>. I need the \`VIEW_CHANNEL\` and \`SEND_MESSAGES\` permissions.`,
            }]
          });
        }

        const duration = ms(interaction.options.getString('duration')!);
        const winnerCount = interaction.options.getInteger('winners')!;
        const prize = interaction.options.getString('prize')!;
        const hostedBy = interaction.options.getUser('hosted_by');
        const drop = interaction.options.getBoolean('drop');

        if (!duration) {
          return await interaction.editReply({
            embeds: [{
              author: {
                name: 'Invalid duration',
                iconURL: client.customEmojisUrl.error,
              },
              description: 'The specified duration is invalid.\nIt must be a valid duration (1d, 1h, 1m, ...)',
            }]
          });
        }

        client.giveawaysManager.start(gChannel, {
          duration,
          winnerCount,
          prize,
          messages: {
            giveaway: `${client.customEmojis.giveaway} **Giveaway Started** ${client.customEmojis.giveaway}`,
            giveawayEnded: "🎊 **Giveaway Ended** 🎊",
            winMessage: "Congratulations, {winners}! You won **{this.prize}**!",
            hostedBy: 'Hosted by: {this.hostedBy}',
            drawing: 'Drawing: {timestamp}',
            dropMessage: `Be the first to react with ${client.customEmojis.giveaway}!`,
            inviteToParticipate: `React with ${client.customEmojis.giveaway} to participate!`,
            noWinner: 'Giveaway cancelled, no valid participations.'
          },
          bonusEntries: [
            {
              bonus: async (member) => (await User.findOne({ voted: true, discordId: member?.id })) ? 2 : 1,
              cumulative: false,
            }
          ],
          thumbnail: client.customEmojisUrl.giveaway,
          hostedBy: hostedBy || undefined,
          isDrop: drop || undefined,
        }).then(async (giveaway) => await interaction.editReply({
          embeds: [{
            author: {
              name: 'Giveaway started',
              iconURL: client.customEmojisUrl.success,
            },
            description: `The giveaway has been started in <#${gChannel.id}>.`,
          }],
          components: [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setLabel('Jump to giveaway')
                .setStyle("LINK")
                .setURL(giveaway.message!.url!)
            )
          ]
        }).catch(async (err) => await interaction.editReply({
          embeds: [{
            author: {
              name: 'An error occurred',
              iconURL: client.customEmojisUrl.error,
            },
            description: `An error occurred while starting the giveaway. Please try again later.\n\`\`\`${String(err).substring(0, 3600)}\`\`\``,
          }]
        })));

        break;
      }
      case 'end': {
        const messageId = interaction.options.getString('message_id')!;

        client.giveawaysManager.end(messageId).then(async () => await interaction.editReply({
          embeds: [{
            author: {
              name: 'Giveaway ended',
              iconURL: client.customEmojisUrl.success,
            },
            description: `The giveaway has been ended.`,
          }],
        }).catch(async (err) => await interaction.editReply({
          embeds: [{
            author: {
              name: 'An error occurred',
              iconURL: client.customEmojisUrl.error,
            },
            description: `An error occurred while ending the giveaway. Please try again later.\n\`\`\`${String(err).substring(0, 3600)}\`\`\``,
          }]
        })));

        break;
      }
      case 'delete': {
        const messageId = interaction.options.getString('message_id')!;

        client.giveawaysManager.delete(messageId).then(async () => await interaction.editReply({
          embeds: [{
            author: {
              name: 'Giveaway deleted',
              iconURL: client.customEmojisUrl.success,
            },
            description: `The giveaway has been deleted from the database.`,
          }],
        }).catch(async (err) => await interaction.editReply({
          embeds: [{
            author: {
              name: 'An error occurred',
              iconURL: client.customEmojisUrl.error,
            },
            description: `An error occurred while deleting the giveaway. Please try again later.\n\`\`\`${String(err).substring(0, 3600)}\`\`\``,
          }]
        })));

        break;
      }
      case 'pause': {
        const messageId = interaction.options.getString('message_id')!;

        client.giveawaysManager.pause(messageId).then(async () => await interaction.editReply({
          embeds: [{
            author: {
              name: 'Giveaway paused',
              iconURL: client.customEmojisUrl.success,
            },
            description: `The giveaway has been paused from the database.`,
          }],
        }).catch(async (err) => await interaction.editReply({
          embeds: [{
            author: {
              name: 'An error occurred',
              iconURL: client.customEmojisUrl.error,
            },
            description: `An error occurred while deleting the giveaway. Please try again later.\n\`\`\`${String(err).substring(0, 3600)}\`\`\``,
          }]
        })));

        break;
      }
      case 'resume': {
        const messageId = interaction.options.getString('message_id')!;

        client.giveawaysManager.unpause(messageId).then(async () => await interaction.editReply({
          embeds: [{
            author: {
              name: 'Giveaway resumed',
              iconURL: client.customEmojisUrl.success,
            },
            description: `The giveaway has been resumed from the database.`,
          }],
        }).catch(async (err) => await interaction.editReply({
          embeds: [{
            author: {
              name: 'An error occurred',
              iconURL: client.customEmojisUrl.error,
            },
            description: `An error occurred while resuming the giveaway. Please try again later.\n\`\`\`${String(err).substring(0, 3600)}\`\`\``,
          }]
        })));

        break;
      }
      case 'reroll': {
        const messageId = interaction.options.getString('message_id')!;

        client.giveawaysManager.unpause(messageId).then(async () => await interaction.editReply({
          embeds: [{
            author: {
              name: 'Giveaway rerolled',
              iconURL: client.customEmojisUrl.success,
            },
            description: `The giveaway has been rerolled from the database.`,
          }],
        }).catch(async (err) => await interaction.editReply({
          embeds: [{
            author: {
              name: 'An error occurred',
              iconURL: client.customEmojisUrl.error,
            },
            description: `An error occurred while rerolling the giveaway. Please try again later.\n\`\`\`${String(err).substring(0, 3600)}\`\`\``,
          }]
        })));

        break;
      }
    }
  },
}