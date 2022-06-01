import { Event } from "../interfaces/Event";
import { MessageEmbed, WebhookClient } from "discord.js";

export const event: Event = {
  name: 'error',

  run: async (client, error: Error) => {
    const webhook = new WebhookClient({
      id: process.env.ERROR_WEBHOOK_ID!,
      token: process.env.ERROR_WEBHOOK_TOKEN!,
    });

    await webhook.send({
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: 'Lambda Bot | Bot Process' })
          .setColor('#2f3136')
          .setTimestamp()
          .setTitle('**[ERROR]** Uncaught Exception')
          .setDescription(error.stack?.substring(0, 4096) || `**${error.name}:** ${error.message}`.substring(0, 4096)),
      ],
    }).catch((e) => console.log(e));

    console.log(error);
  }
}