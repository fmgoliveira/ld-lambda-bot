import Command from "../../interfaces/Command";
import { TextChannel } from "discord.js";
import Guild from "../../database/models/Guild";
import { ColorResolvable } from "discord.js";

export const command: Command = {
  name: "slowmode",
  description: "Set a channel slowmode",
  dmOnly: false,
  guildOnly: true,
  category: 'moderation',
  userPermissions: ['MANAGE_CHANNELS'],
  botPermissions: ['MANAGE_CHANNELS'],
  options: [
    {
      name: 'seconds',
      description: 'The amount of seconds to set the slowmode to',
      type: 4,
      minValue: 0,
      maxValue: 21600,
      required: true
    },
  ],
  usage: ['slowmode <seconds>'],
  ephemeralReply: true,

  run: async (client, interaction) => {
    const guildSettings = await Guild.findOne({ guildId: interaction.guild!.id });
    if (guildSettings && !guildSettings.commands.moderation.slowmode) return await interaction.editReply({
      embeds: [{
        author: {
          name: 'Command disabled',
          iconURL: client.customEmojisUrl.error,
        },
        description: 'This command is not enabled in this server. Go to the [dashboard](https://bot.lambdadev.xyz/login) and enable it in the Moderation Module settings.',
        color: client.colors.error.decimal,
      }],
    });

    const amount = interaction.options.getInteger('seconds')!;

    await (interaction.channel as TextChannel).setRateLimitPerUser(amount).then(async () => {
      await interaction.editReply({
        embeds: [
          {
            author: { name: 'Slowmode set', iconURL: client.customEmojisUrl.success },
            description: `Set the slowmode of ${interaction.channel} to \`${amount}s\`.`,
            color: client.colors.success.decimal,
          }
        ]
      })
    });
  }
}