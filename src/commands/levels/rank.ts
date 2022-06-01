import Guild from "../../database/models/Guild";
import Command from "../../interfaces/Command";
import Levels, { User } from 'discord-xp';

export const command: Command = {
  name: 'rank',
  description: 'Get a user\'s level',
  category: 'levels',
  dmOnly: false,
  guildOnly: true,
  cooldown: 3,
  ephemeralReply: true,
  usage: ['rank [user]'],
  options: [
    {
      name: 'user',
      type: 6,
      description: 'The user to get the rank of',
      required: false
    },
  ],

  run: async (client, interaction) => {
    const db = await Guild.findOne({ guildId: interaction.guildId })!;
    const user = interaction.options.getUser('user') || interaction.user!;
    const userDb: User & { position?: any } = await Levels.fetch(user.id, interaction.guildId!, true);

    if (!db?.modules.levels.enabled) return interaction.editReply({
      embeds: [
        {
          author: { name: 'Module Disabled', icon_url: client.customEmojisUrl.error },
          description: 'This module is not enabled in this server. Enable it at the online dashboard.',
          color: client.colors.error.decimal
        }
      ]
    });

    if (!db?.commands.levels.rank) return interaction.editReply({
      embeds: [
        {
          author: { name: 'Command Disabled', icon_url: client.customEmojisUrl.error },
          description: 'This command is not enabled in this server. Enable it at the online dashboard.',
          color: client.colors.error.decimal
        }
      ]
    });

    if (!userDb) return interaction.editReply({
      embeds: [
        {
          author: { name: 'User Not Found', icon_url: client.customEmojisUrl.error },
          description: 'The user you specified does not have any xp.',
          color: client.colors.error.decimal
        }
      ]
    });

    const rank = userDb.level;
    const xp = userDb.xp;
    const xpInCurrentLevel = userDb.cleanXp;
    const xpToNextLevel = userDb.cleanNextLevelXp;

    const percentage = (100 * xpInCurrentLevel) / xpToNextLevel;
    const percentageValue = parseInt(String(percentage / 10));
    const percentageString = `${'🟧'.repeat(percentageValue)}${'⬜'.repeat(10 - percentageValue)}`;

    return await interaction.editReply({
      embeds: [
        {
          author: { name: 'User Rank', icon_url: client.customEmojisUrl.levels },
          title: `Position: **#${userDb.position}**`,
          description: `<@${user.id}> is level **${rank}** with **\`${xp}\`** xp.\n\n> **Next Level:**\n> ${percentageString} (\`${xpInCurrentLevel}/${xpToNextLevel}\`)`,
          color: client.colors.embedColor.decimal
        }
      ]
    });

  }
}