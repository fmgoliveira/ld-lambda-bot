import { GuildMemberRoleManager, MessageEmbed, MessageEmbedAuthor } from "discord.js";
import { PermissionString } from "discord.js";
import { Interaction } from "discord.js";
import { Event } from "../interfaces/Event";
import { formatPermsArray } from "../utils/formatPermsArray";
import ms from 'ms';
import { ExtendedCommandInteraction } from "../interfaces/Command";
import { ExtendedSelectMenuInteraction } from "../interfaces/SelectMenu";
import { ExtendedButtonInteraction } from "../interfaces/Button";
import User from "../database/models/User";
import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";
import { WebhookClient, GuildMember } from "discord.js";
import Guild from "../database/models/Guild";
import { Message } from "discord.js";
import { ExtendedModalSubmitInteraction } from "../interfaces/Modal";

export const event: Event = {
  name: 'interactionCreate',

  run: async (client, interaction: Interaction) => {
    const userDb = await User.findOne({ discordId: interaction.user.id });

    if (((interaction.isButton() && interaction.customId !== 'privacyPolicy-accept') || interaction.isCommand() || interaction.isSelectMenu() || interaction.isContextMenu() || interaction.isModalSubmit()) && (!userDb || !userDb.acceptedPolicy)) return await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setColor(client.colors.embedColor.decimal)
          .setAuthor({ name: `${client.user?.username} | Privacy Policy & ToS`, iconUrl: client.user?.displayAvatarURL({ dynamic: true }) } as MessageEmbedAuthor)
          .setThumbnail(client.user!.displayAvatarURL({ dynamic: true }))
          .setDescription(`You need to accept the **Privacy Policy** and the **Terms of Service** to use this bot.`)
          .addField('Privacy Policy', `
          Our Privacy Policy describes our policies and procedures on the collection, use and disclosure of your information when you use the bot and tells you about your privacy rights and how the law protects you.
    
          > **We use your personal data to provide and improve the bot. By using the bot, you agree to the collection and use of information in accordance with our Privacy Policy.**

          **Where can I find the Privacy Policy?**
          You can read the Privacy Policy by clicking on **[this link](https://bot.lambdadev.xyz/policy)**.

          _ _
          `)
          .addField('Terms of Service', `
          Our Terms of Service constitute a legally binding agreement made between you and Lambda Development, concerning your access to and use of the bot. You agree that by utilising the bot, you have read, understood, and agreed to be bound by all of our Terms of Service. 

          > **If you do not agree with all of our Terms of Service, then you are expressly prohibited from using the bot and you must discontinue use immediately.**

          **Where can I find the Terms of Service?**
          You can read the Terms of Service by clicking on **[this link](https://bot.lambdadev.xyz/terms)**.
          `)
          .setFooter({ text: 'By clicking in the button below, you agree to the terms above.' }),
      ],
      components: [
        new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setCustomId('privacyPolicy-accept')
              .setStyle('SUCCESS')
              .setLabel('Accept')
          )
      ],
      ephemeral: true,
      fetchReply: true,
    });

    if ((interaction.isButton() || interaction.isCommand() || interaction.isSelectMenu() || interaction.isContextMenu() || interaction.isModalSubmit()) && userDb?.blacklisted) {
      const logsWebhook = new WebhookClient({
        url: process.env.BOT_WEBHOOK_URL!,
      });

      logsWebhook.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.colors.embedColor.decimal)
            .setAuthor({
              name: 'Blacklisted User Action Log',
              iconURL: client.customEmojisUrl.blacklisted,
            })
            .setDescription('A blacklisted user tried to interact with the bot.')
            .addField('User', `${interaction.user.tag} (\`${interaction.user.id}\`)`)
            .addField('Channel', interaction.isModalSubmit() ? 'None' : interaction.guild ? `${interaction.guild.name} (\`${interaction.guild.id}\`): ${interaction.guild.channels.cache.get(interaction.channelId)!.name} (\`${interaction.channelId}\`)` : `DM (\`${interaction.channelId}\`)`)
            .addField('Interaction', interaction.isButton() ? `Button: \`${interaction.customId}\`` : interaction.isCommand() ? `Command: \`${interaction.commandName}\`` : interaction.isSelectMenu() ? `Select Menu: \`${interaction.customId}\`` : interaction.isContextMenu() ? `Context Menu: \`${interaction.commandName}\`` : 'Unknown')
            .setTimestamp(),
        ]
      });

      return await interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor(client.colors.error.decimal)
            .setAuthor({ name: `Support Required`, iconUrl: client.customEmojisUrl.blacklisted } as MessageEmbedAuthor)
            .setDescription(`**Your account has been blacklisted** from using the bot because of any suspicious behaviour we've noticed coming from it.\n*If you think this is a mistake, please get in contact with the Team at our **[Support Server](${client.mainGuildLink})**.*`)
        ],
        components: [
          new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setURL(client.mainGuildLink)
                .setStyle('LINK')
                .setLabel('Support Server')
            )
        ],
        ephemeral: true,
      });
    }

    if (interaction.guild && !(await Guild.findOne({ guildId: interaction.guild.id }))) {
      const guildDb = new Guild({
        guildId: interaction.guild.id,
        guildIcon: interaction.guild.icon,
        guildOwner: interaction.guild.ownerId,
        guildName: interaction.guild.name,
      });

      await guildDb.save();
    }

    if (interaction.isButton()) {
      const button = client.buttons.get(`${interaction.customId.split('-')[0]}-${interaction.customId.split('-')[1]}`);
      if (!button) return interaction.reply({
        embeds: [
          {
            author: { name: 'This button is not registered in the bot.', iconURL: client.customEmojisUrl.error },
            description: `It may have been deleted/updated. If you think this is an error, contact the Team at our **[Support Server](${client.mainGuildLink})**.`,
            color: client.colors.error.decimal,
          }
        ],
        components: [
          {
            type: 'ACTION_ROW',
            components: [
              {
                type: "BUTTON",
                label: 'Support Server',
                style: 'LINK',
                url: client.mainGuildLink,
                emoji: client.customEmojis.support,
              },
            ],
          },
        ],
        ephemeral: true
      });

      if (button.reply && !button.denyDeferReply) {
        if (button.ephemeralReply) await interaction.deferReply({ ephemeral: true });
        else await interaction.deferReply();
      }
      button.run(client, interaction as ExtendedButtonInteraction);

    } else if (interaction.isSelectMenu()) {
      if (['music-searchSelect'].includes(interaction.customId)) return;

      const selectMenu = client.selectMenus.get(`${interaction.customId.split('-')[0]}-${interaction.customId.split('-')[1]}`);
      if (!selectMenu) return interaction.reply({
        embeds: [
          {
            author: { name: 'This select menu is not registered in the bot.', iconURL: client.customEmojisUrl.error },
            description: `It may have been deleted/updated. If you think this is an error, contact the Team at our **[Support Server](${client.mainGuildLink})**.`,
            color: client.colors.error.decimal,
          }
        ],
        components: [
          {
            type: 'ACTION_ROW',
            components: [
              {
                type: "BUTTON",
                label: 'Support Server',
                style: 'LINK',
                url: client.mainGuildLink,
                emoji: client.customEmojis.support,
              },
            ],
          },
        ],
        ephemeral: true
      });

      if (selectMenu.reply && !selectMenu.denyDeferReply) {
        if (selectMenu.ephemeralReply) await interaction.deferReply({ ephemeral: true });
        else await interaction.deferReply();
      }
      selectMenu.run(client, interaction as ExtendedSelectMenuInteraction);
    } else if (interaction.isModalSubmit()) {
      const modal = client.modals.get(`${interaction.customId.split('-')[0]}-${interaction.customId.split('-')[1]}`);
      if (!modal) return interaction.reply({
        embeds: [
          {
            author: { name: 'This modal is not registered in the bot.', iconURL: client.customEmojisUrl.error },
            description: `It may have been deleted/updated. If you think this is an error, contact the Team at our **[Support Server](${client.mainGuildLink})**.`,
            color: client.colors.error.decimal,
          }
        ],
        components: [
          {
            type: 'ACTION_ROW',
            components: [
              {
                type: "BUTTON",
                label: 'Support Server',
                style: 'LINK',
                url: client.mainGuildLink,
                emoji: client.customEmojis.support,
              },
            ],
          },
        ],
        ephemeral: true
      });

      if (modal.reply && !modal.denyDeferReply) {
        if (modal.ephemeralReply) await interaction.deferReply({ ephemeral: true });
        else await interaction.deferReply();
      }
      modal.run(client, interaction as ExtendedModalSubmitInteraction);
    } else if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) return interaction.reply({
        embeds: [
          {
            author: { name: 'This command is not registered in the bot.', iconURL: client.customEmojisUrl.error },
            description: `It may have been deleted/updated. If you think this is an error, contact the Team at our **[Support Server](${client.mainGuildLink})**.`,
            color: client.colors.error.decimal,
          }
        ],
        components: [
          {
            type: 'ACTION_ROW',
            components: [
              {
                type: "BUTTON",
                label: 'Support Server',
                style: 'LINK',
                url: client.mainGuildLink,
                emoji: client.customEmojis.support,
              },
            ],
          },
        ],
        ephemeral: true
      });

      if (command.devOnly ?? false) {
        const role = client.guilds.cache.get(process.env.DEV_GUILD!)?.roles.cache.get(process.env.BOT_DEV!);
        if (role && !(interaction.member?.roles as GuildMemberRoleManager).cache.has(role.id)) {
          return interaction.reply({
            embeds: [
              {
                description: `${client.customEmojis.error} | **This command may only be used by the bot's developers.`,
                color: client.colors.error.decimal,
              }
            ],
            ephemeral: true
          });
        }
      }

      if ((command.staffOnly ?? false) && interaction.inGuild()) {
        const db = await Guild.findOne({ guildId: interaction.guild!.id });
        if (db) {
          const roles = db.modules.administration.staffRoles;
          if (roles.length > 0) {
            const member = interaction.member!;
            const memberRoles = member.roles as GuildMemberRoleManager;
            if (!memberRoles.cache.some(r => roles.includes(r.id))) {
              return interaction.reply({
                embeds: [
                  {
                    description: `${client.customEmojis.error} | This command may only be used by the server staff.\n*The Server Staff Roles can be set in the online dashboard.*`,
                    color: client.colors.error.decimal,
                  }
                ],
                ephemeral: true
              });
            }
          }
        }
      }

      if ((command.category === 'moderation') && interaction.inGuild()) {
        const db = await Guild.findOne({ guildId: interaction.guild!.id });
        if (db) {
          const roles = db.modules.moderation.moderatorRoles;
          if (roles.length > 0) {
            const member = interaction.member!;
            const memberRoles = member.roles as GuildMemberRoleManager;
            if (!memberRoles.cache.some(r => roles.includes(r.id))) {
              return interaction.reply({
                embeds: [
                  {
                    description: `${client.customEmojis.error} | This command may only be used by the server moderators.\n*The Moderator Roles can be set in the online dashboard.*`,
                    color: client.colors.error.decimal,
                  }
                ],
                ephemeral: true
              });
            }
          }
        }
      }

      if (command.botAdminOnly ?? false) {
        const role = client.guilds.cache.get(process.env.DEV_GUILD!)?.roles.cache.get(process.env.BOT_ADMIN!);
        if (role && !(interaction.member?.roles as GuildMemberRoleManager).cache.has(role.id)) {
          return interaction.reply({
            embeds: [
              {
                description: `${client.customEmojis.error} | This command may only be used by the bot's administrators.`,
                color: client.colors.error.decimal,
              }
            ],
            ephemeral: true
          });
        }
      }

      if (command.votedOnly ?? false) {
        const db = await User.findOne({ discordId: interaction.user!.id });
        if (db && !db.voted) return interaction.reply({
          embeds: [
            {
              description: `${client.customEmojis.error} | This command may only be used by users who have upvoted our bot.`,
              color: client.colors.error.decimal,
              footer: { text: 'Check the `/vote` command for more info on upvoting the bot.' }
            }
          ],
          ephemeral: true
        });
      }

      if (command.guildOnly ?? false) {
        if (!interaction.inGuild()) {
          return interaction.reply({
            embeds: [
              {
                description: `${client.customEmojis.error} | This command may only be used inside of a server.`,
                color: client.colors.error.decimal,
              }
            ],
            ephemeral: true
          });
        }
      }

      if (command.dmOnly ?? false) {
        if (!interaction.inGuild()) {
          return interaction.reply({
            embeds: [
              {
                description: `${client.customEmojis.error} | This command may only be used inside of Direct Messages (DM's).`,
                color: client.colors.error.decimal,
              }
            ],
            ephemeral: true
          });
        }
      }

      const staffRoles = (await Guild.findOne({ guildId: interaction.guild!.id }))?.modules.administration.staffRoles;
      const moderatorRoles = (await Guild.findOne({ guildId: interaction.guild!.id }))?.modules.moderation.moderatorRoles;

      if (interaction.inGuild() && (!command.staffOnly || (command.staffOnly && !staffRoles) || (command.category === 'moderation' && !moderatorRoles))) {
        const userPerms = formatPermsArray(command.userPermissions as PermissionString[]);
        if (!(interaction.memberPermissions?.has(command.userPermissions ?? []) ?? false)) {
          return interaction.reply({
            embeds: [
              {
                description: `${client.customEmojis.error} | You do not have the required permissions to use this command. You need the following ones:\n\`\`\`${userPerms}\`\`\``,
                color: client.colors.error.decimal,
              },
            ],
            ephemeral: true,
          });
        }
      }

      if (interaction.inGuild()) {
        const botPerms = formatPermsArray(command.botPermissions as PermissionString[]);
        if (!(interaction.guild?.me?.permissions.has(command.botPermissions ?? []) ?? false)) {
          return interaction.reply({
            embeds: [
              {
                description: `${client.customEmojis.error} | I do not have the required permissions to run this command. I need the following ones:\n\`\`\`${botPerms}\`\`\``,
                color: client.colors.error.decimal,
              },
            ],
            ephemeral: true,
          });
        }
      }

      if (command.cooldown !== undefined) {
        const cooldown = client.cooldowns.get(`${command.name}/${interaction.user.id}`);
        if (cooldown) {
          const timePassed = Date.now() - cooldown.timeSet;
          const timeLeft = command.cooldown * 1000 - timePassed;

          let response = command.cooldownResponse ?? `Hey! You're going too fast, please wait another \`${ms(timeLeft)}\` before using that command again.`;

          if (response.includes("{time}")) {
            const replace = new RegExp("{time}", "g");
            response = response.replace(replace, ms(timeLeft));
          }

          return interaction.reply({ embeds: [{ author: { name: 'Hold on for a bit!', iconURL: client.customEmojisUrl.error }, description: response, color: client.colors.error.decimal }], ephemeral: true });
        }
        client.cooldowns.set(`${command.name}/${interaction.user.id}`, {
          command: command.name,
          cooldownTime: command.cooldown,
          timeSet: Date.now(),
          userID: interaction.user.id
        });

        setTimeout(() => {
          client.cooldowns.delete(`${command.name}/${interaction.user.id}`);
        }, command.cooldown * 1000);
      }

      if (!command.denyDeferReply) {
        command.ephemeralReply ? await interaction.deferReply({ ephemeral: true }) : await interaction.deferReply();
      }

      if (command.category === 'music' && interaction.inGuild()) {
        if (!(interaction.member as GuildMember).voice.channel) return interaction.replied || interaction.deferred ? await interaction.editReply({
          embeds: [
            {
              author: { name: 'You are not in a voice channel.', iconURL: client.customEmojisUrl.error },
              description: 'You need to be in a voice channel in order to use the Music Module commands. Please join one and try again.',
              color: client.colors.error.decimal,
            }
          ],
        }) : await interaction.reply({
          embeds: [
            {
              author: { name: 'You are not in a voice channel.', iconURL: client.customEmojisUrl.error },
              description: 'You need to be in a voice channel in order to use the Music Module commands. Please join one and try again.',
              color: client.colors.error.decimal,
            }
          ],
        });
      }

      command.run(client, interaction as ExtendedCommandInteraction);
    }
  }
}