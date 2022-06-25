import Guild from "../../database/models/Guild";
import Command from "../../interfaces/Command";
import Levels from 'discord-xp';

export const command: Command = {
  name: 'leaderboard',
  description: 'See the top 10 users with the most xp',
  category: 'levels',
  dmOnly: false,
  guildOnly: true,
  cooldown: 3,

  run: async (client, interaction) => {
    const db = await Guild.findOne({ guildId: interaction.guildId })!;

    if (!db?.modules.levels.enabled) return interaction.editReply({
      embeds: [
        {
          author: { name: 'Module Disabled', icon_url: client.customEmojisUrl.error },
          description: 'This module is not enabled in this server. Enable it at the online dashboard.',
          color: client.colors.error.decimal
        }
      ]
    });

    if (!db?.commands.levels.leaderboard) return interaction.editReply({
      embeds: [
        {
          author: { name: 'Command Disabled', icon_url: client.customEmojisUrl.error },
          description: 'This command is not enabled in this server. Enable it at the online dashboard.',
          color: client.colors.error.decimal
        }
      ]
    });

    const rawLeaderboard = await Levels.fetchLeaderboard(interaction.guildId!, 10);
    if (rawLeaderboard.length === 0) return interaction.editReply({
      embeds: [
        {
          author: { name: 'Leaderboard Empty', icon_url: client.customEmojisUrl.error },
          description: 'There are no users with any xp in this server.',
          color: client.colors.error.decimal
        }
      ]
    });

    const leaderboard = await Levels.computeLeaderboard(client, rawLeaderboard, true);

    const lb = leaderboard.map((e) => `> **${e.position}.** ${e.username}#${e.discriminator}\n> Level: \`${e.level}\`; XP: \`${e.xp}\``).join('\n\n');

    return await interaction.editReply({
      embeds: [
        {
          author: { name: 'Server Leaderboard', icon_url: client.customEmojisUrl.levels },
          description: `Here are the top 10 XP gatherers in this server:\n\n${lb}`,
          color: client.colors.embedColor.decimal
        }
      ]
    });

  }
}