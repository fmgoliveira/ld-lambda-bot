import Command from "../../interfaces/Command";
import { TextChannel } from "discord.js";
import Guild from "../../database/models/Guild";
import { ColorResolvable } from "discord.js";
import Warn from "../../database/models/Warn";

export const command: Command = {
  name: "warn",
  description: "Warn a member from the server",
  dmOnly: false,
  guildOnly: true,
  category: 'moderation',
  userPermissions: ['MODERATE_MEMBERS'],
  options: [
    {
      name: 'target',
      description: 'The member you want to warn',
      type: 6,
      required: true
    },
    {
      name: 'reason',
      description: 'The reason for the warn',
      type: 3,
      required: true,
    },
  ],
  usage: ['warn <target> <reason>'],

  run: async (client, interaction) => {
    const guildSettings = await Guild.findOne({ guildId: interaction.guild!.id });
    if (guildSettings && !guildSettings.commands.moderation.warn) return await interaction.editReply({
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
    const reason = interaction.options.getString('reason')!;

    const warning = {
      moderator: interaction.user!.tag,
      timestamp: Date.now(),
      reason,
    };

    await Warn.findOneAndUpdate({
      guildId: interaction.guildId!,
      userId: user.id,
    }, {
      guildId: interaction.guildId!,
      userId: user.id,
      $push: {
        warnings: warning,
      },
    }, { upsert: true, new: true });

    const db = await Guild.findOne({ guildId: interaction.guildId });
    await interaction.editReply({
      embeds: [
        {
          author: { name: 'User warned', iconURL: client.customEmojisUrl.success },
          description: `**${user.tag}** was warned.${db?.modules.moderation.includeReason ? ' || ' + reason : ''}`,
          color: client.colors.success.decimal,
        }
      ]
    });

    if (db?.modules.moderation.dm.warn) try {
      await user.send({
        embeds: [
          {
            author: { name: 'You were warned in ' + interaction.guild!.name, iconURL: interaction.guild!.iconURL() || undefined },
            title: 'Warning Notice',
            description: `You were warned in ${interaction.guild!.name} by ${interaction.member!.user.tag}.\n**Reason:** ${reason}`,
            color: client.colors.embedColor.decimal,
            timestamp: parseInt(String(Date.now() / 1000)),
          },
        ],
      });
    } catch (err) { console.log(err) };

    if (db?.modules.logging.moderation.enabled && db?.modules.logging.moderation.events.warn) {
      const logChannel = interaction.guild!.channels.cache.get(db.modules.logging.moderation.channel) as TextChannel;

      if (logChannel) {
        try {
          await logChannel.send({
            embeds: [
              {
                author: { name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) },
                title: 'Moderation - Warn Command',
                description: `${interaction.user} warned ${user.tag} with reason \`${reason}\`.`,
                color: db.modules.logging.moderation.color as ColorResolvable,
              },
            ],
          });
        } catch (err) { console.log(err) }
      }
    }
  }
}