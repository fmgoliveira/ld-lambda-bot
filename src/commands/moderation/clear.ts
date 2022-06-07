import Command from "../../interfaces/Command";
import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";
import { TextChannel } from "discord.js";
import { NewsChannel } from "discord.js";
import { Message } from "discord.js";
import Guild from "../../database/models/Guild";
import { ColorResolvable } from "discord.js";

export const command: Command = {
  name: "clear",
  description: "Purge a certain amount of messages from a channel",
  dmOnly: false,
  guildOnly: true,
  category: 'moderation',
  userPermissions: ['MANAGE_MESSAGES'],
  botPermissions: ['MANAGE_MESSAGES'],
  ephemeralReply: true,
  options: [
    {
      name: 'amount',
      description: 'The amount of messages to delete',
      type: 4,
      minValue: 1,
      maxValue: 100,
      required: true
    },
    {
      name: 'channel',
      description: 'The channel to delete messages from',
      type: 7,
      required: false,
    },
    {
      name: 'user',
      description: 'Filter by user',
      type: 6,
      required: false,
    },
    {
      name: 'role',
      description: 'Filter by role',
      type: 8,
      required: false,
    },
  ],
  usage: ['clear <amount> [channel] [user]', 'clear <amount> [channel] [role]', 'clear <amount>', 'clear <amount> [user]', 'clear <amount> [role]'],

  run: async (client, interaction) => {
    const guildSettings = await Guild.findOne({ guildId: interaction.guild!.id });
    if (guildSettings && !guildSettings.commands.moderation.clear) return await interaction.editReply({
      embeds: [{
        author: {
          name: 'Command disabled',
          iconURL: client.customEmojisUrl.error,
        },
        description: 'This command is not enabled in this server. Go to the [dashboard](https://bot.lambdadev.xyz/login) and enable it in the Moderation Module settings.',
        color: client.colors.error.decimal,
      }],
    });

    const amount = interaction.options.getInteger('amount')!;
    const channel = (interaction.options.getChannel('channel') || interaction.channel!) as TextChannel | NewsChannel;
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');

    const messages = await channel.messages.fetch();

    const filtered: Message[] = [];
    if (user) {
      let i = 0;

      messages.forEach((m) => {
        if (m.author.id === user.id && !m.pinned && amount > i) {
          filtered.push(m);
          i++;
        }
      });
    } else if (role) {
      let i = 0;

      messages.forEach((m) => {
        if (m.member?.roles.cache.has(role.id) && !m.pinned && amount > i) {
          filtered.push(m);
          i++;
        }
      });
    } else {
      let i = 0;

      messages.forEach((m) => {
        if (!m.pinned && amount > i) {
          filtered.push(m);
          i++;
        }
      });
    }

    if (filtered.length === 0) return await interaction.editReply({
      embeds: [
        {
          author: { name: 'No messages found', iconURL: client.customEmojisUrl.error },
          description: 'No messages were found that match the criteria',
          color: client.colors.error.decimal,
        }
      ]
    });

    channel.bulkDelete(filtered, true).then(async (messages) => {
      await interaction.editReply({
        embeds: [
          {
            author: { name: 'Messages deleted', iconURL: client.customEmojisUrl.success },
            description: `Successfully deleted ${messages.size} messages${user ? ` from ${user}` : role ? ` from users with ${role} role` : ''}.`,
            color: client.colors.success.decimal,
          }
        ]
      })
    });

    const db = await Guild.findOne({ guildId: interaction.guildId });
    if (db?.modules.logging.moderation.enabled && db?.modules.logging.moderation.events.clear) {
      const logChannel = interaction.guild!.channels.cache.get(db.modules.logging.moderation.channel) as TextChannel;

      if (logChannel) {
        try {
          await logChannel.send({
            embeds: [
              {
                author: { name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) },
                title: 'Moderation - Clear Command',
                description: `${interaction.user} cleared ${amount} messages${user ? ` from ${user}` : role ? ` from users with ${role} role` : ''} in ${channel}.`,
                color: db.modules.logging.moderation.color as ColorResolvable,
              },
            ],
          });
        } catch (err) { console.log(err) }
      }
    }
  }
}