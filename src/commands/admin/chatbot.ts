import { Collection } from "discord.js";
import { TextChannel } from "discord.js";
import { NewsChannel } from "discord.js";
import { MessageEmbed } from "discord.js";
import Guild from "../../database/models/Guild";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: "chatbot",
  description: "Configure the chatbot module",
  guildOnly: true,
  dmOnly: false,
  category: 'admin',
  ephemeralReply: true,
  userPermissions: ['MANAGE_GUILD'],
  cooldown: 3,
  usage: [
    "chatbot <add|remove|list> [channel]",
  ],
  options: [
    {
      name: "channel",
      type: 1,
      description: "Manage the channels where the Chatbot functionality is enabled",
      options: [
        {
          name: "action",
          description: "Add or remove a channel",
          type: 3,
          choices: [
            { name: "add", value: "add" },
            { name: "remove", value: "remove" },
          ],
          required: true,
        },
        {
          name: "channel",
          description: "The channel you want to add/remove",
          type: 7,
          channelTypes: ["GUILD_TEXT", "GUILD_NEWS"],
          required: true,
        },
      ]
    },
    {
      name: 'list',
      type: 1,
      description: 'List the channels where the Chatbot functionality is enabled',
    },
  ],

  run: async (client, interaction) => {
    const guildSettings = await Guild.findOne({ guildId: interaction.guild!.id }) || new Guild({
      guildId: interaction.guild!.id,
      guildName: interaction.guild!.name,
      guildIcon: interaction.guild!.icon,
      guildOwner: interaction.guild!.ownerId,
    });

    const subCommand = interaction.options.getSubcommand();
    const action = interaction.options.getString('action') as 'add' | 'remove';
    const channel = interaction.options.getChannel('channel') as TextChannel | NewsChannel;

    if (!guildSettings.modules.administration.chatbot.enabled) return await interaction.editReply({
      embeds: [{
        author: {
          name: 'Chatbot module is not enabled',
          iconURL: client.customEmojisUrl.error,
        },
        description: 'You need to enable the chatbot module first. Go to the [dashboard](https://bot.lambdadev.xyz/login) and enable it in the Administration Module settings.',
        color: client.colors.error.decimal,
      }],
    });

    const channels = guildSettings.modules.administration.chatbot.channels;
    const guildChannels = interaction.guild!.channels.cache.filter(c => channels.includes(c.id));

    switch (subCommand) {
      case 'list':
        return await interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setAuthor({
                name: `Lambda Bot | Chatbot Channels`
              })
              .setDescription(guildChannels.size > 0 ? `The following channels are enabled for the chatbot module:\n\n${guildChannels.map((c) => `> • <#${c.id}> (ID: \`${c.id}\`)`).join('\n')}` : 'No channels are enabled for the chatbot module.')
              .setFooter({ text: 'Use `/chatbot channel` to manage the channels' })
              .setColor(client.colors.embedColor.decimal),
          ],
        });
        break;

      case 'channel':
        if (!guildSettings.commands.administration.chatbot) return await interaction.editReply({
          embeds: [{
            author: {
              name: 'Command disabled',
              iconURL: client.customEmojisUrl.error,
            },
            description: 'This command is not enabled in this server. Go to the [dashboard](https://bot.lambdadev.xyz/login) and enable it in the Administration Module settings.',
            color: client.colors.error.decimal,
          }],
        });

        switch (action) {
          case 'add':
            if (guildChannels && guildChannels.has(channel.id)) return await interaction.editReply({
              embeds: [{
                author: {
                  name: 'Channel already enabled',
                  iconURL: client.customEmojisUrl.error,
                },
                description: `The channel <#${channel.id}> (ID: \`${channel.id}\`) is already enabled for chatbot module.`,
                color: client.colors.error.decimal,
              }],
            });

            guildSettings.modules.administration.chatbot.channels.push(channel.id);
            await guildSettings.save();

            return await interaction.editReply({
              embeds: [{
                author: {
                  name: 'Channel added',
                  iconURL: client.customEmojisUrl.success,
                },
                description: `The channel <#${channel.id}> (ID: \`${channel.id}\`) has been added to the chatbot module.`,
                color: client.colors.success.decimal,
              }],
            });

            break;

          case 'remove':
            if (guildChannels && !guildChannels.has(channel.id)) return await interaction.editReply({
              embeds: [{
                author: {
                  name: 'Channel not enabled',
                  iconURL: client.customEmojisUrl.error,
                },
                description: `The channel <#${channel.id}> (ID: \`${channel.id}\`) is not enabled yet for chatbot module.`,
                color: client.colors.error.decimal,
              }],
            });

            guildSettings.modules.administration.chatbot.channels = guildSettings.modules.administration.chatbot.channels.filter(c => c !== channel.id);
            await guildSettings.save();

            return await interaction.editReply({
              embeds: [{
                author: {
                  name: 'Channel removed',
                  iconURL: client.customEmojisUrl.success,
                },
                description: `The channel <#${channel.id}> (ID: \`${channel.id}\`) has been removed from the chatbot module.`,
                color: client.colors.success.decimal,
              }],
            });

            break;

        };
    };
  }
};