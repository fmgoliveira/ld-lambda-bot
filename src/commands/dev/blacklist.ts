import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";
import { TextChannel } from "discord.js";
import User from "../../database/models/User";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: "blacklist",
  description: "Blacklists/Unblacklists a user from using the bot",
  options: [
    {
      name: 'option',
      description: 'Whether to blacklist or to unblacklist',
      type: 3,
      required: true,
      choices: [{ name: 'blacklist', value: 'blacklist' }, { name: 'unblacklist', value: 'unblacklist' }]
    },
    {
      name: 'user_id',
      description: 'The user id to blacklist',
      required: true,
      type: 3
    }
  ],
  botAdminOnly: true,
  guildOnly: false,
  dmOnly: false,
  category: 'dev',

  run: async (client, interaction) => {
    const choice = interaction.options.getString('option')! as 'blacklist' | 'unblacklist';
    const userId = interaction.options.getString('user_id')!;

    const userDb = await User.findOne({ discordId: userId }) || new User({ discordId: userId });
    if (choice === 'blacklist') {
      if (userDb.blacklisted) return await interaction.editReply('User is already blacklisted');
      userDb.blacklisted = true;
    } else {
      if (!userDb.blacklisted) return await interaction.editReply('User is not blacklisted');
      userDb.blacklisted = false;
    }
    await userDb.save();

    await interaction.editReply({ content: `**User ${choice}ed** | ID: \`${userId}\`` });
  }
};