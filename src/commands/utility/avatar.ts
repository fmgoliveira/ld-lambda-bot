import { MessageEmbed } from "discord.js";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: "avatar",
  description: "Get the avatar of a user",
  category: "utility",
  usage: ['avatar [target]'],
  options: [
    {
      name: 'target',
      description: 'The user to get the avatar from',
      required: false,
      type: 6
    }
  ],
  dmOnly: false,
  guildOnly: true,
  cooldown: 3,
  ephemeralReply: true,

  run: async (client, interaction) => {
    const user = interaction.options.getUser('target') || interaction.user;
    const member = interaction.guild!.members.cache.get(user.id);

    const avatar = member ? member.user.displayAvatarURL({ format: 'png', dynamic: true }) : user.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setColor(client.colors.embedColor.decimal)
      .setAuthor({ name: user.tag, iconURL: avatar })
      .setImage(avatar);
      
    await interaction.editReply({
      embeds: [embed]
    });
  }
}