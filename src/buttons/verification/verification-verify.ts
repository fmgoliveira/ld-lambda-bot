import Guild from "../../database/models/Guild";
import Button from "../../interfaces/Button";

export const button: Button = {
  name: 'verification-verify',
  ephemeralReply: true,
  reply: true,

  run: async (client, interaction) => {
    const guildDb = (await Guild.findOne({ guildId: interaction.guildId }))!;
    const verifyDb = guildDb.modules.verification;
    const user = interaction.user;
    if (!verifyDb.enabled) return await interaction.editReply({
      embeds: [
        {
          author: { name: 'Module Disabled', iconURL: client.customEmojisUrl.error },
          description: 'Verification module is disabled in this server. Enable it in the server settings.',
          color: client.colors.error.decimal,
        }
      ]
    });

    const rolesToAdd = verifyDb.rolesToAdd;
    const rolesToRemove = verifyDb.rolesToRemove;

    const member = interaction.guild?.members.cache.get(user ? user.id : interaction.user.id);
    const memberHasAddRoles = rolesToAdd.every(r => member?.roles.cache.has(r));
    const memberHasRemoveRoles = member?.roles.cache.some(r => rolesToRemove.includes(r.id));

    if (memberHasAddRoles && !memberHasRemoveRoles) return await interaction.editReply({
      embeds: [
        {
          author: { name: 'Already Verified', iconURL: client.customEmojisUrl.error },
          description: 'You are already verified in this server.',
          color: client.colors.error.decimal,
        }
      ]
    });

    try {
      member?.roles.cache.forEach(async (r) => {
        if (rolesToRemove.includes(r.id) && rolesToAdd.includes(r.id)) return;
        if (rolesToRemove.includes(r.id)) await member.roles.remove(r);
      });

      rolesToAdd.forEach(async (r) => {
        if (rolesToRemove.includes(r)) return;
        if (!member?.roles.cache.has(r)) await member?.roles.add(r);
      });

      await interaction.editReply({
        embeds: [
          {
            author: { name: 'Verified', iconURL: client.customEmojisUrl.success },
            description: 'You have been verified in this server.',
            color: client.colors.success.decimal,
          }
        ]
      });
    } catch (err) {
      console.log(err);
      return await interaction.editReply({
        embeds: [
          {
            author: { name: 'Error', iconURL: client.customEmojisUrl.error },
            description: 'An error occured while trying to verify you.',
            color: client.colors.error.decimal,
          }
        ]
      });
    }
  },
}