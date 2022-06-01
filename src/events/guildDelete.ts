import { Event } from "../interfaces/Event";
import { Guild as DiscordGuild } from 'discord.js';
import { WebhookClient } from "discord.js";
import { MessageEmbed } from "discord.js";

export const event: Event = {
  name: "guildDelete",

  run: async (client, guild: DiscordGuild) => {

    // Send Message to Dev Server
    await (async () => {
      const embed = new MessageEmbed()
        .setTitle('Left Guild')
        .setColor(client.colors.error.decimal)
        .setDescription(`Name: **${guild.name}**\nID: **\`${guild.id}\`**\nOwner ID: **\`${guild.ownerId}\`**\nMember Count: **${guild.memberCount}**\nCreated At: **<t:${parseInt(String(guild.createdTimestamp / 1000))}>**`)
        .setTimestamp()

      if (guild.iconURL({ dynamic: true })) embed.setThumbnail(guild.iconURL({ dynamic: true })!);

      const webhook = new WebhookClient({
        url: process.env.BOT_WEBHOOK_URL!,
      });

      await webhook.send({ embeds: [embed] });
    })();
  }
};