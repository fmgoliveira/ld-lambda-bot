import { NewsChannel } from "discord.js";
import { MessageEmbed } from "discord.js";
import { TextChannel } from "discord.js";
import Guild from "../../database/models/Guild";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: "autoreact",
  description: "Configure the autoreact module",
  guildOnly: true,
  dmOnly: false,
  category: "admin",
  ephemeralReply: true,
  userPermissions: ["MANAGE_GUILD"],
  cooldown: 3,
  usage: [
    "autoreact <add|remove|list> [channel] [emoji]",
  ],
  options: [
    {
      name: "channel",
      type: 1,
      description: "Manage the channels where the Autoreact functionality is enabled",
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
        {
          name: "emojis",
          description: "The emojis you want the bot to react with (comma separated, only unicode and server emojis)",
          type: 3,
          required: false,
        },
      ],
    },
    {
      name: 'list',
      type: 1,
      description: 'List the channels where the Autoreact functionality is enabled',
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
    const emojis = interaction.options.getString('emojis') as string;

    const objects = guildSettings.modules.administration.autoreact.map((o) => ({
      channel: interaction.guild!.channels.cache.get(o.channel) as TextChannel | NewsChannel | undefined,
      emojis: o.emojis,
    }));
    objects.forEach(async (o, i) => {
      if (o.channel?.id === channel.id) {
        guildSettings.modules.administration.autoreact.splice(i, 1);
        await guildSettings.save();
        objects.splice(i, 1);
      }
    });

    switch (subCommand) {
      case 'list':
        return await interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setAuthor({
                name: `Lambda Bot | Autoreact Channels`
              })
              .setDescription(objects.length > 0 ? `The following channels are enabled for the autoreact module:\n\n${objects.map((o) => `> • <#${o.channel!.id}> (ID: \`${o.channel!.id}\` - ${o.emojis.join(',')})`).join('\n')}` : 'No channels are enabled for the autoreact module.')
              .setFooter({ text: 'Use `/autoreact channel` to manage the channels' })
              .setColor(client.colors.embedColor.decimal),
          ],
        });
        break;

      case 'channel':
        if (!guildSettings.commands.administration.autoreact) return await interaction.editReply({
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
            if (objects && objects.some((o) => o.channel!.id === channel.id)) return await interaction.editReply({
              embeds: [{
                author: {
                  name: 'Channel already enabled',
                  iconURL: client.customEmojisUrl.error,
                },
                description: `The channel <#${channel.id}> (ID: \`${channel.id}\`) is already enabled for autoreact module.`,
                color: client.colors.error.decimal,
              }],
            });

            if (!emojis || emojis.length === 0) return await interaction.editReply({
              embeds: [{
                author: {
                  name: 'No emojis provided',
                  iconURL: client.customEmojisUrl.error,
                },
                description: 'You need to provide at least one emoji. Separate them with a comma.',
                color: client.colors.error.decimal,
              }],
            });
            const emojisParsed = emojis.split(',').map((e) => e.trim()).filter((e) => e.length > 0);

            guildSettings.modules.administration.autoreact.push({ channel: channel.id, emojis: emojisParsed });
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
            if (objects && !objects.some((o) => o.channel!.id === channel.id)) return await interaction.editReply({
              embeds: [{
                author: {
                  name: 'Channel not enabled',
                  iconURL: client.customEmojisUrl.error,
                },
                description: `The channel <#${channel.id}> (ID: \`${channel.id}\`) is not enabled yet for autoreact module.`,
                color: client.colors.error.decimal,
              }],
            });

            guildSettings.modules.administration.autoreact = guildSettings.modules.administration.autoreact.filter(c => c.channel !== channel.id);
            await guildSettings.save();

            return await interaction.editReply({
              embeds: [{
                author: {
                  name: 'Channel removed',
                  iconURL: client.customEmojisUrl.success,
                },
                description: `The channel <#${channel.id}> (ID: \`${channel.id}\`) has been removed from the autoreact module.`,
                color: client.colors.success.decimal,
              }],
            });

            break;

        };
    };
  },
}