import { MessageEmbed } from "discord.js";
import User from "../../database/models/User";
import Button from "../../interfaces/Button";

export const button: Button = {
  name: 'privacyPolicy-accept',
  ephemeralReply: true,
  reply: true,

  run: async (client, interaction) => {
    const userDb = await User.findOne({ discordId: interaction.user.id }) || new User({
      discordId: interaction.user.id,
      discordUsername: interaction.user.username,
      discordDiscriminator: interaction.user.discriminator,
      discordAvatar: interaction.user.avatar,
      acceptedPolicy: false,
    });

    if (userDb.acceptedPolicy) return await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'Already Accepted Privacy Policy & ToS',
            iconURL: client.customEmojisUrl.error,
          })
          .setDescription(`You have already accepted the privacy policy and the ToS.`)
          .setColor(client.colors.error.decimal),
      ]
    });

    userDb.acceptedPolicy = true;
    await userDb.save();

    await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'Accepted Privacy Policy & ToS',
            iconURL: client.customEmojisUrl.success,
          })
          .setDescription(`You have accepted the privacy policy and the ToS. You may now use the bot.`)
          .setColor(client.colors.success.decimal),
      ]
    });
  },
}