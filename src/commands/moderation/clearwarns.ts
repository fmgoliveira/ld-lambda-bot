import Command from "../../interfaces/Command";
import { TextChannel } from "discord.js";
import Guild from "../../database/models/Guild";
import { ColorResolvable } from "discord.js";
import Warn from "../../database/models/Warn";

export const command: Command = {
  name: "clearwarns",
  description: "Clear all warnings from a member",
  dmOnly: false,
  guildOnly: true,
  category: 'moderation',
  userPermissions: ['MODERATE_MEMBERS'],
  ephemeralReply: true,
  options: [
    {
      name: 'target',
      description: 'The member you want to clear the warns from',
      type: 6,
      required: true
    },
  ],
  usage: ['clearwarns <target>'],

  run: async (client, interaction) => {
    const guildSettings = await Guild.findOne({ guildId: interaction.guild!.id });
    if (guildSettings && !guildSettings.commands.moderation.clearwarns) return await interaction.editReply({
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

    await res.remove();

    const db = await Guild.findOne({ guildId: interaction.guildId });
    await interaction.editReply({
      embeds: [
        {
          author: { name: 'Warnings cleared', iconURL: client.customEmojisUrl.success },
          description: `**${user.tag}** had his warnings cleared.`,
          color: client.colors.success.decimal,
        }
      ]
    });
  }
}