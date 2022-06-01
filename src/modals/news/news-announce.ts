import { MessageEmbedAuthor } from "discord.js";
import { MessageButton } from "discord.js";
import { MessageActionRow } from "discord.js";
import { MessageEmbed } from "discord.js";
import Modal from "../../interfaces/Modal";
import placeholderReplace from "../../utils/placeholderReplace";

export const modal: Modal = {
  name: "news-announce",
  reply: true,
  ephemeralReply: true,

  run: async (client, modal) => {
    const title = modal.fields.getTextInputValue("title");
    const description = modal.fields.getTextInputValue("description");

    client.guilds.cache.forEach(async (g) => {
      const owner = g.members.cache.get(g.ownerId)?.user;
      if (!owner) return;

      const embed = new MessageEmbed()
        .setAuthor({ name: `Lambda Global Announcements`, iconURL: client.user?.displayAvatarURL({ format: 'png', dynamic: true }) || undefined })
        .setColor(client.colors.embedColor.decimal)
        .setTitle(title)
        .setDescription(placeholderReplace(description, g, owner))
        .setFooter({ text: `Announcement by: Lambda Development Team` });

      try {
        await owner.send({ embeds: [embed], components: [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setLabel(`Sent from: ${g.name}`.substring(0, 80))
              .setStyle('SECONDARY')
              .setDisabled(true)
              .setCustomId('sentFromGuild')
          )
        ] });
      } catch { }
    });

    await modal.followUp({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: "Announcement sent",
            iconUrl: client.customEmojisUrl.success,
          } as MessageEmbedAuthor)
          .setDescription("Your announcement has been sent.")
          .setColor(client.colors.success.decimal)
          .setTimestamp(),
      ],
      components: [
        new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setURL(client.mainGuildLink)
              .setLabel("Support Server")
              .setStyle("LINK")
          )
      ],
    });
  },
}