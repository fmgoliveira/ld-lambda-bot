import Command from "../../interfaces/Command";
import { TextChannel } from "discord.js";
import Guild from "../../database/models/Guild";
import { ColorResolvable } from "discord.js";

export const command: Command = {
  name: "kick",
  description: "Kick a member from the server",
  dmOnly: false,
  guildOnly: true,
  category: 'moderation',
  userPermissions: ['KICK_MEMBERS'],
  botPermissions: ['KICK_MEMBERS'],
  options: [
    {
      name: 'target',
      description: 'The member you want to kick',
      type: 6,
      required: true
    },
    {
      name: 'reason',
      description: 'The reason for the kick',
      type: 3,
      required: false,
    },
  ],
  usage: ['kick <target> [reason]'],

  run: async (client, interaction) => {
    const guildSettings = await Guild.findOne({ guildId: interaction.guild!.id });
    if (guildSettings && !guildSettings.commands.moderation.kick) return await interaction.editReply({
      embeds: [{
        author: {
          name: 'Command disabled',
          iconURL: client.customEmojisUrl.error,
        },
        description: 'This command is not enabled in this server. Go to the [dashboard](https://bot.lambdadev.xyz/login) and enable it in the Moderation Module settings.',
        color: client.colors.error.decimal,
      }],
    });

    const user = interaction.options.getUser('target')!;
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (interaction.user?.id === user.id) return interaction.editReply({
      embeds: [
        {
          author: { name: 'You can\'t kick yourself.', iconURL: client.customEmojisUrl.error },
          description: 'You can\'t kick yourself. If you really want to, you can leave the server by yourself.',
          color: client.colors.error.decimal,
        }
      ],
    });

    if (interaction.guild!.me?.roles?.highest?.position! <= (interaction.guild!.members.cache.get(user.id)?.roles?.highest?.position || 0) || interaction.guild!.ownerId === user.id) return interaction.editReply({
      embeds: [
        {
          author: { name: 'I can\'t kick this user.', iconURL: client.customEmojisUrl.error },
          description: 'I can\'t kick this user. One of his roles is higher than my highest role.',
          color: client.colors.error.decimal,
        }
      ],
    });

    const db = await Guild.findOne({ guildId: interaction.guildId });
    await interaction.guild!.members.kick(user, reason).then(async (messages) => {
      await interaction.editReply({
        embeds: [
          {
            author: { name: 'User kicked', iconURL: client.customEmojisUrl.success },
            description: `**${user.tag}** was kicked.${db?.modules.moderation.includeReason ? ' || ' + reason : ''}`,
            color: client.colors.success.decimal,
          }
        ]
      })
    });

    if (db?.modules.moderation.dm.kick) try {
      await user.send({
        embeds: [
          {
            author: { name: 'You were kicked from ' + interaction.guild!.name, iconURL: interaction.guild!.iconURL() || undefined },
            title: 'Kick Notice',
            description: `You were kicked from ${interaction.guild!.name} by ${interaction.member!.user.tag}.\n**Reason:** ${reason}`,
            color: client.colors.embedColor.decimal,
            timestamp: parseInt(String(Date.now() / 1000)),
          },
        ],
      });
    } catch (err) { console.log(err) };

    if (db?.modules.logging.moderation.enabled && db?.modules.logging.moderation.events.kick) {
      const logChannel = interaction.guild!.channels.cache.get(db.modules.logging.moderation.channel) as TextChannel;

      if (logChannel) {
        try {
          await logChannel.send({
            embeds: [
              {
                author: { name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) },
                title: 'Moderation - Kick Command',
                description: `${interaction.user} kicked ${user.tag} with reason \`${reason}\`.`,
                color: db.modules.logging.moderation.color as ColorResolvable,
              },
            ],
          });
        } catch (err) { console.log(err) }
      }
    }
  }
}