import Guild from "../../database/models/Guild";
import Command from "../../interfaces/Command";
import Levels from 'discord-xp';

export const command: Command = {
  name: 'xp',
  description: 'Manage a user xp',
  category: 'levels',
  dmOnly: false,
  guildOnly: true,
  cooldown: 3,
  ephemeralReply: true,
  staffOnly: true,
  usage: ['xp give <user> <amount>', 'xp remove <user> <amount>', 'xp set <user> <amount>'],
  options: [
    {
      name: 'give',
      type: 1,
      description: 'Give a user xp',
      options: [
        {
          name: 'user',
          type: 6,
          description: 'The user to give xp to',
          required: true
        },
        {
          name: 'amount',
          type: 4,
          minValue: 1,
          description: 'The amount of xp to give',
          required: true
        }
      ]
    },
    {
      name: 'remove',
      type: 1,
      description: 'Remove xp from a user',
      options: [
        {
          name: 'user',
          type: 6,
          description: 'The user to remove xp from',
          required: true
        },
        {
          name: 'amount',
          type: 4,
          minValue: 1,
          description: 'The amount of xp to remove',
          required: true
        }
      ]
    },
    {
      name: 'set',
      type: 1,
      description: 'Set a user\'s xp',
      options: [
        {
          name: 'user',
          type: 6,
          description: 'The user to set xp for',
          required: true
        },
        {
          name: 'amount',
          type: 4,
          minValue: 1,
          description: 'The amount of xp to set',
          required: true
        }
      ]
    }
  ],

  run: async (client, interaction) => {
    const subCommand = interaction.options.getSubcommand() as 'give' | 'remove' | 'set';
    const db = await Guild.findOne({ guildId: interaction.guildId })!;
    const user = interaction.options.getUser('user')!;
    const amount = interaction.options.getInteger('amount')!;
    const userDb = await Levels.fetch(user.id, interaction.guildId!) || await Levels.createUser(user.id, interaction.guildId!);

    if (!db?.modules.levels.enabled) return interaction.editReply({
      embeds: [
        {
          author: { name: 'Module Disabled', icon_url: client.customEmojisUrl.error },
          description: 'This module is not enabled in this server. Enable it at the online dashboard.',
          color: client.colors.error.decimal
        }
      ]
    });

    switch (subCommand) {
      case 'give':
        if (!db?.commands.levels.giveXp) return interaction.editReply({
          embeds: [
            {
              author: { name: 'Command Disabled', icon_url: client.customEmojisUrl.error },
              description: 'This command is not enabled in this server. Enable it at the online dashboard.',
              color: client.colors.error.decimal
            }
          ]
        });

        await Levels.appendXp(user.id, interaction.guildId!, amount);

        return await interaction.editReply({
          embeds: [
            {
              author: { name: 'Given XP to user', icon_url: client.customEmojisUrl.success },
              description: 'Successfully given **`' + amount + '`** xp to **<@' + user.id + '>**.',
              color: client.colors.success.decimal
            }
          ]
        });

      case 'remove':
        if (!db?.commands.levels.removeXp) return interaction.editReply({
          embeds: [
            {
              author: { name: 'Command Disabled', icon_url: client.customEmojisUrl.error },
              description: 'This command is not enabled in this server. Enable it at the online dashboard.',
              color: client.colors.error.decimal
            }
          ]
        });

        await Levels.subtractXp(user.id, interaction.guildId!, amount);

        return await interaction.editReply({
          embeds: [
            {
              author: { name: 'Removed XP from user', icon_url: client.customEmojisUrl.success },
              description: 'Successfully removed **`' + amount + '`** xp from **<@' + user.id + '>**.',
              color: client.colors.success.decimal
            }
          ]
        });

      case 'set':
        if (!db?.commands.levels.setXp) return interaction.editReply({
          embeds: [
            {
              author: { name: 'Command Disabled', icon_url: client.customEmojisUrl.error },
              description: 'This command is not enabled in this server. Enable it at the online dashboard.',
              color: client.colors.error.decimal
            }
          ]
        });

        await Levels.setXp(user.id, interaction.guildId!, amount);

        return await interaction.editReply({
          embeds: [
            {
              author: { name: 'Set XP for user', icon_url: client.customEmojisUrl.success },
              description: 'Successfully set **`' + amount + '`** xp for **<@' + user.id + '>**.',
              color: client.colors.success.decimal
            }
          ]
        });
    }
  }
}