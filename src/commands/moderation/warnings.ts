import Command from "../../interfaces/Command";
import { TextChannel } from "discord.js";
import Guild from "../../database/models/Guild";
import { ColorResolvable } from "discord.js";
import Warn from "../../database/models/Warn";

export const command: Command = {
  name: "warnings",
  description: "List all warnings from a member",
  dmOnly: false,
  guildOnly: true,
  category: 'moderation',
  userPermissions: ['MODERATE_MEMBERS'],
  ephemeralReply: true,
  options: [
    {
      name: 'target',
      description: 'The member you want to list the warns from',
      type: 6,
      required: true
    },
  ],
  usage: ['clearwarns <target>'],

  run: async (client, interaction) => {
    const guildSettings = await Guild.findOne({ guildId: interaction.guild!.id });
    if (guildSettings && !guildSettings.commands.moderation.warnings) return await interaction.editReply({
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

    const res = await Warn.findOne({ guildId: interaction.guildId!, userId: user.id });

    if (!res || !res.warnings || res.warnings.length === 0) return await interaction.editReply({
      embeds: [
        {
          author: { name: 'No warns found', iconURL: client.customEmojisUrl.error },
          description: `**${user.tag}** has no warnings logged.`,
          color: client.colors.error.decimal,
        }
      ]
    });

    await interaction.editReply({
      embeds: [
        {
          author: { name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) },
          title: `Warnings of ${user.username}`,
          description: 'Here are all the warnings logged for this user:\n\n' + res.warnings.map((warn, i) => `> **Warn #${i}**: By \`${warn.moderator}\` with reason \`${warn.reason}\` <t:${parseInt(String(Number(warn.timestamp) / 1000))}:R>`).join(';\n'),
          color: client.colors.embedColor.decimal,
        }
      ]
    });
  }
}