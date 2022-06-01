import { Event } from "../interfaces/Event";
import { Guild as DiscordGuild } from 'discord.js';
import { WebhookClient } from "discord.js";
import { MessageEmbed } from "discord.js";

export const event: Event = {
  name: "guildCreate",

  run: async (client, guild: DiscordGuild) => {
    const guildOwner = guild.members.cache.get(guild.ownerId)?.user;

    // Send Message to Dev Server
    await (async () => {
      const embed = new MessageEmbed()
        .setTitle('Joined Guild')
        .setColor(client.colors.success.decimal)
        .setDescription(`Name: **${guild.name}**\nID: **\`${guild.id}\`**\nOwner ID: **\`${guild.ownerId}\`**\nMember Count: **${guild.memberCount}**\nCreated At: **<t:${parseInt(String(guild.createdTimestamp / 1000))}>**`)
        .setTimestamp()

      if (guild.iconURL({ dynamic: true })) embed.setThumbnail(guild.iconURL({ dynamic: true })!);

      const webhook = new WebhookClient({
        url: process.env.BOT_WEBHOOK_URL!,
      });

      await webhook.send({ embeds: [embed] });
    })();

    // Send Message to Guild Owner
    await (async () => {
      const embed = new MessageEmbed()
        .setTitle('Thank you for inviting Lambda Bot')
        .setColor(client.colors.embedColor.decimal)
        .setThumbnail(client.user?.displayAvatarURL({ dynamic: true })!)
        .setFooter({ text: 'Creator: DrMonocle#4948' })
        .setAuthor({ name: `Lambda Bot v${process.env.BOT_VERSION}`, iconURL: client.user?.displayAvatarURL({ dynamic: true }) || undefined })
        .setDescription(`
          Thank you for inviting our bot. Lambda Bot uses [slash commands](https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ#:~:text=Slash%20Commands%20are%20the%20new,command%20right%20the%20first%20time.) (the prefix to use the bot is \`/\`) and all the modules are interaction-based.
          
          Lambda Bot was designed and developed by **${client.customEmojis.companyLogo} [Lambda Development](https://www.lambdadev.xyz)**. For the code guys, the bot was written in TypeScript and uses the [discord.js](https://discord.js.org/) framework.

          Using this bot has never been so easy! And, to make sure you get the most out of it, we have a **[Support Server](${client.mainGuildLink})** where you can ask questions and get help from other users and from the Team.

          **[Website](https://bot.lambdadev.xyz)** | **[Dashboard](https://bot.lambdadev.xyz/login)** | **[Invite](${client.inviteLink})** | **[Support Server](${client.mainGuildLink})** | **[Wiki](https://wiki.lambdadev.xyz/bot)**
        `)

      try {
        await guildOwner?.send({ embeds: [embed] });
      } catch (error) {
        console.error(error);
      }
    })();
  }
};