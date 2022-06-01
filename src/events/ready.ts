import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Event } from "../interfaces/Event"
import chalk from 'chalk';
import { getGuild } from "../utils/getGuild";
import { ActivitiesOptions } from "discord.js";

export const event: Event = {
  name: "ready",
  once: true,

  run: async (client) => {
    console.log(`${chalk.green('[INFO]')} Bot logged in as ${client.user?.tag} in ${client.guilds.cache.size} guilds\n`)

    let currentIndex = 0;
    const activities: ActivitiesOptions[] = [
      {
        name: "bot.lambdadev.xyz",
        type: "WATCHING"
      },
      {
        name: `/help`,
        type: "LISTENING"
      },
      {
        name: "bot.lambdadev.xyz",
        type: "WATCHING"
      }
    ];

    setInterval(() => {
      const activity = activities[currentIndex]

      client.user?.setPresence({ activities: [activity] })

      currentIndex = currentIndex >= activities.length - 1 ? 0 : currentIndex + 1
    }, 20000)

    if (!client.application?.owner) await client.application?.fetch();

    if (client.application === null) throw new Error(chalk.red('[FATAL] Client did not register on time, please try again'));

    const commands = client.commands.map(({ run, guildOnly, devOnly, dmOnly, botPermissions, userPermissions, ...data }) => data);

    console.log(`${chalk.cyan('[LIST]')} Bot Commands: ${commands.map((c) => c.name).join(', ') || 'No commands registered'}\n`);

    try {
      if (process.env.NODE_ENV === 'development') {
        const guild = await getGuild(process.env.DEV_GUILD!, client);
        if (guild === null) return void console.log(`${chalk.red('[ERROR]')} Bot could not fetch development guild`);

        await guild.commands.set(commands);
        console.log(`${chalk.green("[INFO]")} Set Commands for development server\nCommand List: ${(await guild.commands.fetch()).map((c) => c.name).join(", ")}\n`);
      } else {
        const globalCommands = commands.filter(x => !x.botAdminOnly && x.category !== 'dev');
        await client.application.commands.set(globalCommands);
        console.log(`${chalk.green("[INFO]")} Set Commands for production mode (all guilds the bot is in)\nCommand List:\n ${(await client.application.commands.fetch()).map((c) => c.name).join(", ")}\n`);

        const guild = await getGuild(process.env.DEV_GUILD!, client);
        if (guild === null) return void console.log(`${chalk.red('[ERROR]')} Bot could not fetch bot admins guild`);

        await guild.commands.set(commands.filter((c) => c.botAdminOnly === true));
        console.log(`${chalk.green("[INFO]")} Set Bot Admin Commands for development server\nCommand List: ${(await guild.commands.fetch()).map((c) => c.name).join(", ")}\n`);
      };

    } catch (e) {
      console.log(`${chalk.red("[ERROR]")} There was an error registering the slash commands\n${e}`);
    }

    const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN!);
    const clientId = client.application.id;

    await (async (): Promise<void> => {
      try {
        console.log(`${chalk.blue("[PROCESS]")} Started refreshing application (slash) commands`);

        if (process.env.NODE_ENV === 'development') {
          await rest.put(
            Routes.applicationGuildCommands(clientId, process.env.DEV_GUILD!),
            { body: commands }
          )

          console.log(`${chalk.blue("[PROCESS]")} Refreshing Commands in development mode`);
        } else {
          await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
          )

          console.log(`${chalk.blue("[PROCESS]")} Refreshing Commands in production mode. This can take a while (Possibly up to an hour or longer)`);
        }

        console.log(`${chalk.green("[INFO]")} Sucessfully reloaded application (slash) commands\n`);
      } catch (error) {
        console.log(`${chalk.red("[ERROR]")} There was an error refreshing application (slash) commands\n${error}`);
      }
    })();

    if (process.env.NODE_ENV !== 'development') await client.webhooks.bot.send({
      embeds: [
        {
          author: {
            name: 'Bot Ready',
            icon_url: client.customEmojisUrl.success,
          },
          color: client.colors.embedColor.decimal,
          description: `Bot logged in as **${client.user?.tag}** in **${client.guilds.cache.size} guilds** <t:${parseInt(String(Date.now() / 1000))}:R>`,
        },
      ],
    });
  }
};