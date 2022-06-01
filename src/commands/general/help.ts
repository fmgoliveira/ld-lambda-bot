import Command from "../../interfaces/Command";
import { MessageEmbed } from "discord.js";
import { MessageActionRow } from "discord.js";
import { MessageSelectMenu } from "discord.js";
import { client } from "../..";

export const command: Command = {
  name: "help",
  description: "The help center for Lambda Bot",
  dmOnly: false,
  guildOnly: false,
  denyDeferReply: true,
  usage: [
    "help <command>",
    "help <module>",
  ],
  options: [
    {
      type: 3,
      name: "command",
      description: 'View more information about a specific command',
      required: false,
    },
    {
      type: 3,
      name: "module",
      description: 'View more information about a specific command module',
      choices: client.modulesMapping.map(({ label, value }) => ({ name: label, value })),
      required: false,
    },
  ],
  category: 'general',

  run: async (client, interaction) => {
    const command = interaction.options.getString('command');
    const module = interaction.options.getString('module');

    const embed = new MessageEmbed()
      .setColor(client.colors.mainColor.decimal)
      .setThumbnail(client.user?.displayAvatarURL({ dynamic: true })!)
      .setFooter({ text: 'Get info on a specific command: `/help [command]`\nGet info on a specific commands module: `/help [module]`' })

    if (!command && !module) {
      embed.setAuthor({ name: `Lambda Bot v${process.env.BOT_VERSION}`, iconURL: client.user?.displayAvatarURL({ dynamic: true }) || undefined });
      embed.setDescription(`
        Welcome to the help center for **${client.customEmojis.botLogo} [Lambda Bot](https://bot.lambdadev.xyz)**! Here you can check every command and every module the bot provides you. Lambda bot uses [slash commands](https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ#:~:text=Slash%20Commands%20are%20the%20new,command%20right%20the%20first%20time.) (the prefix to use the bot is \`/\`) and all the modules are interaction-based.
        
        Besides the usage of Discord Interactions to make it easier for the user to interact with the bot, Lambda Bot also has a **[web dashboard](https://bot.lambdadev.xyz/login)** for the bot, where you can configure all the modules of the bot and manage the bot in your server.

        Lambda Bot was designed and developed by **${client.customEmojis.companyLogo} [Lambda Development](https://www.lambdadev.xyz)**. For the code guys, the bot was written in TypeScript and uses the [discord.js](https://discord.js.org/) framework.

        Using this bot has never been so easy! And, to make sure you get the most out of it, we have a **[Support Server](${client.mainGuildLink})** where you can ask questions and get help from other users and from the Team.

        **If you want to know more about the bot, use the \`/about\` command.**

        **[Website](https://bot.lambdadev.xyz)** | **[Dashboard](https://bot.lambdadev.xyz/login)** | **[Invite](${client.inviteLink})** | **[Support Server](${client.mainGuildLink})**
      `);

      await interaction.reply({
        embeds: [embed],
        components: [
          new MessageActionRow()
            .addComponents(
              new MessageSelectMenu()
                .setCustomId('help-selectModule')
                .setPlaceholder('Select a module')
                .setOptions([
                  { label: 'About Lambda Bot', value: 'about', description: 'View information about the bot itself', emoji: client.customEmojis.modules.about },
                  ...new Set(client.commands.map((cmd) => cmd.category).filter((cat) => cat !== 'dev').map((cat) => client.modulesMapping.find((m) => m.value === cat) || { label: cat, value: cat }))
                ])
            )
        ]
      });

      setTimeout(async () => {
        return await interaction.editReply({
          components: [
            new MessageActionRow()
              .addComponents(
                new MessageSelectMenu()
                  .setDisabled(true)
                  .setCustomId('help-selectModule')
                  .setPlaceholder('Select a module')
                  .addOptions([
                    { label: 'About Lambda Bot', value: 'about', description: 'View information about the bot itself', emoji: client.customEmojis.modules.about },
                    ...new Set(client.commands.map((cmd) => cmd.category).filter((cat) => cat !== 'dev').map((cat) => client.modulesMapping.find((m) => m.value === cat) || { label: cat, value: cat }))
                  ])
              )
          ]
        });
      }, 60 * 1000);
    }

    if (command) {
      const cmd = client.commands.find((c) => c.name === command);
      if (!cmd) return await interaction.reply({
        embeds: [{
          color: client.colors.error.decimal,
          author: {
            name: 'Command not found',
            icon_url: client.customEmojisUrl.error,
          },
          description: `Couldn't find the command \`/${command}\`. If you think this is an error, please contact the Team at the [Support Server](${client.mainGuildLink}).`,
        }],
        ephemeral: true,
      });

      embed.setAuthor({ name: `Lambda Bot | /${cmd.name}`, iconURL: client.user?.displayAvatarURL({ dynamic: true }) || undefined })
        .setTitle(`\`/${cmd.name}\` command`)
        .setDescription(`
        **Description:** ${cmd.description}
        **Usage:** ${cmd.usage ? `${cmd.usage.map((u) => "\`/" + u + "\`").join(', ')}` : `\`/${cmd.name}\``}
        **Module:** ${client.modulesMapping.find((m) => m.value === cmd.category)?.label || 'No category provided'}
        **Cooldown:** \`${cmd.cooldown ? cmd.cooldown + " s" : "0 s"}\`
        
        ${cmd.category === 'tickets' ? `*You can see more info on this specific command using the module help command: \`/help [module: Tickets Module]\`*` : ''}
      `);

      return await interaction.reply({
        embeds: [embed]
      });
    }

    if (module) {
      const moduleMap = client.modulesMapping.find((m) => m.value === module);
      if (!moduleMap) return await interaction.reply({
        embeds: [{
          color: client.colors.error.decimal,
          author: {
            name: 'Module not found',
            icon_url: client.customEmojisUrl.error,
          },
          description: `Couldn't find the module \`${module}\`. If you think this is an error, please contact the Team at the [Support Server](${client.mainGuildLink}).`,
        }],
        ephemeral: true,
      });

      embed.setAuthor({ name: `Lambda Bot | ${moduleMap.label}`, iconURL: client.user?.displayAvatarURL({ dynamic: true }) || undefined })
        .addField('Module Description', moduleMap.description || 'No description provided')
        .addField(module === 'tickets' ?
          `Module Commands [${client.commands.find((cmd) => cmd.name === 'ticket')?.options?.filter((opt) => opt.type === 1).length || 0}]` :
          `Module Commands [${client.commands.filter((cmd) => cmd.category === module).size}]`,
          module === 'tickets' ?
            client.commands.find((cmd) => cmd.name === 'ticket')?.options?.filter((opt) => opt.type === 1).map((opt) => `**\`/ticket ${opt.name}\`**: ${opt.description}`).join('\n\n') || 'There are no commands registered in this module.' :
            client.commands.filter((cmd) => cmd.category === module).map((cmd) => `**\`/${cmd.name}\`**: ${cmd.description}`).join('\n\n') || 'There are no commands registered in this module.'
        );

      await interaction.reply({
        embeds: [embed],
        components: [
          new MessageActionRow()
            .addComponents(
              new MessageSelectMenu()
                .setCustomId('help-selectModule')
                .setPlaceholder('Select a module')
                .setOptions([
                  { label: 'About Lambda Bot', value: 'about', description: 'View information about the bot itself', emoji: client.customEmojis.modules.about },
                  ...new Set(client.commands.map((cmd) => cmd.category).filter((cat) => cat !== 'dev').map((cat) => client.modulesMapping.find((m) => m.value === cat) || { label: cat, value: cat }))
                ])
            )
        ]
      });

      setTimeout(async () => {
        return await interaction.editReply({
          components: [
            new MessageActionRow()
              .addComponents(
                new MessageSelectMenu()
                  .setDisabled(true)
                  .setCustomId('help-selectModule')
                  .setPlaceholder('Select a module')
                  .addOptions([
                    { label: 'About Lambda Bot', value: 'about', description: 'View information about the bot itself', emoji: client.customEmojis.modules.about },
                    ...new Set(client.commands.map((cmd) => cmd.category).filter((cat) => cat !== 'dev').map((cat) => client.modulesMapping.find((m) => m.value === cat) || { label: cat, value: cat }))
                  ])
              )
          ]
        });
      }, 60 * 1000);
    }

  }
}