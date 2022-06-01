import Afk from "../../database/models/Afk";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: 'afk',
  description: 'Set your AFK status',
  usage: ['afk set <status>', 'afk return'],
  dmOnly: false,
  guildOnly: true,
  category: 'utility',
  ephemeralReply: true,
  options: [
    {
      name: 'set',
      type: 1,
      description: 'Set your AFK status',
      options: [
        {
          name: 'status',
          type: 3,
          description: 'The status to set',
          required: true
        }
      ]
    },
    {
      name: 'return',
      type: 1,
      description: 'Return from AFK status'
    }
  ],

  run: async (client, interaction) => {
    const subCommand = interaction.options.getSubcommand() as 'set' | 'return';
    const status = interaction.options.getString('status')!;

    switch (subCommand) {
      case 'set':
        await Afk.findOneAndUpdate({
          guildId: interaction.guildId,
          userId: interaction.user.id,
        }, {
          status,
          time: Date.now().toString()
        }, {
          new: true,
          upsert: true
        });

        return interaction.editReply({
          embeds: [
            {
              author: { name: 'AFK Status Set', iconURL: client.customEmojisUrl.success },
              description: `Your AFK status has been set to **${status}**`,
              color: client.colors.success.decimal
            }
          ]
        });

      case 'return':
        await Afk.deleteOne({ guildId: interaction.guildId, userId: interaction.user.id });

        return interaction.editReply({
          embeds: [
            {
              author: { name: 'Returned from AFK', iconURL: client.customEmojisUrl.success },
              description: 'Your AFK status has been removed',
              color: client.colors.success.decimal,
            }
          ]
        });
    }
  }
}