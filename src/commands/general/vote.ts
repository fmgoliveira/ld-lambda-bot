import Command from "../../interfaces/Command";
import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";
import { aboutPages } from "../../utils/aboutPages";
import { MessageEmbed } from "discord.js";
import User from "../../database/models/User";

export const command: Command = {
  name: "vote",
  description: "Help the bot grow by upvoting it",
  dmOnly: false,
  guildOnly: false,
  category: 'general',

  run: async (client, interaction) => {
    const userVoted = await User.findOne({ discordId: interaction.user.id });

    await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setTitle("Upvote Lambda Bot")
          .setAuthor({ iconURL: interaction.user.displayAvatarURL({ dynamic: true }) || undefined, name: userVoted ? `${interaction.user.username}: You are not receiving benefits. Vote to start doing it!` : `${interaction.user.username}: You are currently receiving vote benefits` })
          .setColor(client.colors.mainColor.decimal)
          .setDescription(`By upvoting <@900398063607242762>, you are helping us (a lot) and it's completely free! Each time you vote for our bot on the sites below, we get more users to our bot.`)
          .addFields([
            {
              name: 'Why should you upvote Lambda Bot?',
              value: `
                First of all, it's free and doesn't take a lot of time. 
                Secondly, you get the following **benefits**:
                
                • Voters role in Lambda Development Discord Server
                • Cool voters badge in the \`/whois\` command and \`User Info\` context command
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
          ])
      ],
      components: [
        new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setLabel('Top.gg')
              .setURL('https://top.gg/bot/900398063607242762/vote')
              .setStyle("LINK"),
            new MessageButton()
              .setLabel('Discord Labs')
              .setURL('https://bots.discordlabs.org/bot/900398063607242762?vote')
              .setStyle("LINK"),
            new MessageButton()
              .setLabel('Infinity Bots')
              .setURL('https://infinitybots.gg/bots/900398063607242762/vote')
              .setStyle("LINK"),
            new MessageButton()
              .setLabel('Bots for Discord')
              .setURL('https://discords.com/bots/bot/900398063607242762/vote')
              .setStyle("LINK"),
          )
      ]
    });
  }
}