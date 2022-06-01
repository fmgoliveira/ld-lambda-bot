import { MessageActionRow, Modal, ModalActionRowComponent, TextInputComponent } from "discord.js";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: 'bugreport',
  description: 'Report a bug',
  guildOnly: false,
  dmOnly: false,
  category: 'bugs',
  ephemeralReply: true,
  denyDeferReply: true,

  run: async (client, interaction) => {
    const bugReportModal = new Modal()
      .setCustomId('bugs-bugreport')
      .setTitle('Bug Report')
      .addComponents(
        new MessageActionRow<ModalActionRowComponent>().addComponents(new TextInputComponent()
          .setCustomId('title')
          .setLabel('Report Title')
          .setStyle('SHORT')
          .setPlaceholder('Briefly describe the bug')
          .setMaxLength(80)
          .setRequired(true)
        ),
        new MessageActionRow<ModalActionRowComponent>().addComponents(new TextInputComponent()
          .setCustomId('description')
          .setLabel('Report Description')
          .setStyle('PARAGRAPH')
          .setPlaceholder('Describe the bug in detail (optional)')
          .setMaxLength(1024)
          .setRequired(false),
        ),
        new MessageActionRow<ModalActionRowComponent>().addComponents(new TextInputComponent()
          .setCustomId('steps')
          .setLabel('Steps to Reproduce')
          .setPlaceholder('What do the developers need to do to find the bug?')
          .setMaxLength(500)
          .setStyle('PARAGRAPH')
          .setRequired(true),
        ),
        new MessageActionRow<ModalActionRowComponent>().addComponents(new TextInputComponent()
          .setCustomId('expected')
          .setLabel('Expected Behavior')
          .setPlaceholder('What is the expected behavior of the bot?')
          .setStyle('PARAGRAPH')
          .setMaxLength(400)
          .setRequired(true),
        ),
        new MessageActionRow<ModalActionRowComponent>().addComponents(new TextInputComponent()
          .setCustomId('actual')
          .setLabel('Actual Behavior')
          .setPlaceholder('What is the actual behavior of the bot?')
          .setStyle('PARAGRAPH')
          .setMaxLength(400)
          .setRequired(true),
        )
      );

    await interaction.showModal(bugReportModal);
  }
}