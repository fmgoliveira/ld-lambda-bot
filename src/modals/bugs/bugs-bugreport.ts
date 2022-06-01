import { MessageEmbedAuthor } from "discord.js";
import { MessageButton } from "discord.js";
import { TextChannel } from "discord.js";
import { MessageActionRow } from "discord.js";
import { MessageEmbed } from "discord.js";
import Bug from "../../database/models/Bug";
import Modal from "../../interfaces/Modal";

export const modal: Modal = {
  name: "bugs-bugreport",
  reply: true,
  ephemeralReply: true,

  run: async (client, modal) => {
    let bugId: number = 1;
    (await Bug.find({})).forEach((bug) => {
      if (bugId <= bug.bugId) bugId = bug.bugId + 1;
    });

    const title = modal.fields.getTextInputValue("title");
    const description = modal.fields.getTextInputValue("description");
    const steps = modal.fields.getTextInputValue("steps");
    const expected = modal.fields.getTextInputValue("expected");
    const actual = modal.fields.getTextInputValue("actual");
    const userId = modal.user.id;
    const timestamp = Date.now();

    await Bug.create({
      userId,
      bugId,
      title,
      description,
      steps,
      expected,
      actual,
      timestamp,
    });

    await modal.followUp({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: "Bug Report Submitted",
            iconUrl: client.customEmojisUrl.success,
          } as MessageEmbedAuthor)
          .setDescription("Your bug report has been submitted. Thank you!")
          .setColor(client.colors.success.decimal)
          .addFields([
            {
              name: `Bug Report #${bugId}`,
              value: `${title}`,
            },
            {
              name: `Description`,
              value: `${description || "No description provided."}`,
            },
            {
              name: `Steps to Reproduce`,
              value: `${steps}`,
            },
            {
              name: `Expected Behavior`,
              value: `${expected}`,
            },
            {
              name: `Actual Behavior`,
              value: `${actual}`,
            },
          ])
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

    const bugsChannel = client.channels.cache.get(process.env.BUGS_CHANNEL!) as TextChannel;
    await bugsChannel.send({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: modal.user.tag + ` (${userId})`,
            iconUrl: modal.user.displayAvatarURL({ dynamic: true }),
          } as MessageEmbedAuthor)
          .setTimestamp()
          .setTitle(`Bug Report #${bugId}`)
          .setColor(client.colors.embedColor.decimal)
          .setDescription(title)
          .addFields([
            {
              name: `Description`,
              value: `${description || "No description provided."}`,
            },
            {
              name: `Steps to Reproduce`,
              value: `${steps}`,
            },
            {
              name: `Expected Behavior`,
              value: `${expected}`,
            },
            {
              name: `Actual Behavior`,
              value: `${actual}`,
            },
            {
              name: `Status`,
              value: `${client.customEmojis.reported} | Reported`,
            },
          ]),
      ],
      components: [
        new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId('bugs-reported')
              .setEmoji(client.customEmojis.reported)
              .setDisabled(true)
              .setStyle('SECONDARY'),
            new MessageButton()
              .setCustomId('bugs-resolved')
              .setEmoji(client.customEmojis.success)
              .setStyle('SECONDARY'),
            new MessageButton()
              .setCustomId('bugs-inprogress')
              .setEmoji(client.customEmojis.inProgress)
              .setStyle('SECONDARY'),
            new MessageButton()
              .setCustomId('bugs-rejected')
              .setEmoji(client.customEmojis.rejected)
              .setStyle('SECONDARY'),
          ),
      ],
    });
  },
}