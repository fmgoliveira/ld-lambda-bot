import User from "../../database/models/User";
import Command from "../../interfaces/Command";
import { Modal, MessageActionRow, ModalActionRowComponent, TextInputComponent} from 'discord.js';

export const command: Command = {
  name: "announce",
  description: "Announce something to all the servers owners.",
  botAdminOnly: true,
  guildOnly: false,
  dmOnly: false,
  category: 'dev',
  ephemeralReply: true,
  denyDeferReply: true,

  run: async (client, interaction) => {
    const modal = new Modal()
      .setCustomId('news-announce')
      .setTitle('Global Announcement')
      .addComponents(
        new MessageActionRow<ModalActionRowComponent>().addComponents(new TextInputComponent()
          .setCustomId('title')
          .setLabel('Embed Title')
          .setStyle('SHORT')
          .setMaxLength(256)
          .setRequired(false)
        ),
        new MessageActionRow<ModalActionRowComponent>().addComponents(new TextInputComponent()
          .setCustomId('description')
          .setLabel('Embed Description')
          .setStyle('PARAGRAPH')
          .setRequired(true),
        ),
      );

    await interaction.showModal(modal);
  }
};