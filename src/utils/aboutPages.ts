import { MessageEmbed } from "discord.js";
import { client } from "..";

export const aboutPages: MessageEmbed[] = [
  new MessageEmbed()
    .setColor(client.colors.embedColor.decimal)
    .setThumbnail(client.user?.displayAvatarURL({ dynamic: true })!)
    .setFooter({ text: 'Creator: DrMonocle#4948' })
    .setAuthor({ name: `Lambda Bot v${process.env.BOT_VERSION}`, iconURL: client.user?.displayAvatarURL({ dynamic: true }) || undefined })
    .setDescription(`
      Welcome to the help center for **${client.customEmojis.botLogo} [Lambda Bot](https://bot.lambdadev.xyz)**! Here you can check every command and every module the bot provides you. Lambda bot uses [slash commands](https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ#:~:text=Slash%20Commands%20are%20the%20new,command%20right%20the%20first%20time.) (the prefix to use the bot is \`/\`) and all the modules are interaction-based.
      
      Lambda Bot was designed and developed by **${client.customEmojis.companyLogo} [Lambda Development](https://www.lambdadev.xyz)**. For the code guys, the bot was written in TypeScript and uses the [discord.js](https://discord.js.org/) framework.

      Using this bot has never been so easy! And, to make sure you get the most out of it, we have a **[Support Server](${client.mainGuildLink})** where you can ask questions and get help from other users and from the Team.

      **[Website](https://bot.lambdadev.xyz)** | **[Dashboard](https://bot.lambdadev.xyz/login)** | **[Invite](${client.inviteLink})** | **[Support Server](${client.mainGuildLink})** | **[Wiki](https://wiki.lambdadev.xyz/bot)**
    `),

  new MessageEmbed()
    .setColor(client.colors.embedColor.decimal)
    .setThumbnail(client.user?.displayAvatarURL({ dynamic: true })!)
    .setFooter({ text: 'Creator: DrMonocle#4948' })
    .setImage('https://cdn.lambdadev.xyz/bot/images/dash.png')
    .setAuthor({ name: `Lambda Bot | Online Dashboard`, iconURL: client.user?.displayAvatarURL({ dynamic: true }) || undefined })
    .setDescription(`
      Besides the usage of Discord Interactions to make it easier for the user to interact with the bot, Lambda Bot also has a **[web dashboard](https://bot.lambdadev.xyz/login)** for the bot, where you can configure all the modules of the bot and manage the bot in your server.

      **What does it offer?**
      > - Insights Pages: Dashboard, Members List & Action Logs
      > - Server Management Modules Settings: Administration, Welcome & Leave, Moderation & Logging
      > - Utility Modules Settings: Tickets, Verification & Levels

      Click **[here](https://bot.lambdadev.xyz/login)** to go to the dashboard page.
    `),

  new MessageEmbed()
    .setColor(client.colors.embedColor.decimal)
    .setThumbnail(client.user?.displayAvatarURL({ dynamic: true })!)
    .setFooter({ text: 'Creator: DrMonocle#4948' })
    .setAuthor({ name: `Lambda Bot | Upvoting`, iconURL: client.user?.displayAvatarURL({ dynamic: true }) || undefined })
    .setDescription(`By upvoting <@900398063607242762>, you are helping us (a lot) and it's completely free! Each time you vote for our bot on the sites below, we get more users to our bot.`)
    .addFields([
      {
        name: 'Why should you upvote Lambda Bot?',
        value: `
        First of all, it's free and doesn't take a lot of time. 
        Secondly, you get the following **benefits**:
        
        • Voters role in Lambda Development Discord Server
        • Cool voters badge in the \`/userinfo\` command
        • Your name listed below on this channel
        • Access to premium-only commands
        • Bonus entry in all giveaways managed by this bot
        • 25% XP Boost in the levelling module
        
        _ _
        `
      },
      {
        name: 'How does the system work?',
        value: `
        Each vote gives you the benefits for 12 hours. This means, **you can get up to 48 hours of benefits** by voting __once__ in every link.

        _ _
        `
      },
      {
        name: 'Where can I upvote the bot?',
        value: `
        You can upvote the bot in any of the links listed below:

        :link: [Top.gg](https://top.gg/bot/900398063607242762/vote)
        :link: [Discord Labs](https://bots.discordlabs.org/bot/900398063607242762?vote)
        :link: [Infinity Bots](https://infinitybots.gg/bots/900398063607242762/vote)
        :link: [Bots for Discord](https://discords.com/bots/bot/900398063607242762/vote)
        `
      }
    ]),

  new MessageEmbed()
    .setColor(client.colors.embedColor.decimal)
    .setThumbnail(client.user?.displayAvatarURL({ dynamic: true })!)
    .setFooter({ text: 'Creator: DrMonocle#4948' })
    .setAuthor({ name: `Lambda Bot | Privacy Policy`, iconURL: client.user?.displayAvatarURL({ dynamic: true }) || undefined })
    .setDescription(`
      Our Privacy Policy describes our policies and procedures on the collection, use and disclosure of your information when you use the bot and tells you about your privacy rights and how the law protects you.

      > **We use your personal data to provide and improve the bot. By using the bot, you agree to the collection and use of information in accordance with our Privacy Policy.**

      _ _
      `)
    .addField('Where can I find the Privacy Policy?', `You can read the Privacy Policy by clicking on **[this link](https://bot.lambdadev.xyz/policy)**.`),

  new MessageEmbed()
    .setColor(client.colors.embedColor.decimal)
    .setThumbnail(client.user?.displayAvatarURL({ dynamic: true })!)
    .setFooter({ text: 'Creator: DrMonocle#4948' })
    .setAuthor({ name: `Lambda Bot | Terms of Service`, iconURL: client.user?.displayAvatarURL({ dynamic: true }) || undefined })
    .setDescription(`
      Our Terms of Service constitute a legally binding agreement made between you and Lambda Development, concerning your access to and use of the bot. You agree that by utilising the bot, you have read, understood, and agreed to be bound by all of our Terms of Service. 

      > **If you do not agree with all of our Terms of Service, then you are expressly prohibited from using the bot and you must discontinue use immediately.**

      _ _
    `)
    .addField('Where can I find the Terms of Service?', `You can read the Terms of Service by clicking on **[this link](https://bot.lambdadev.xyz/terms)**.`),

]