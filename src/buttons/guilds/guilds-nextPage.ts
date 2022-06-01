import { MessageEmbed } from "discord.js";
import { MessageButton } from "discord.js";
import { MessageActionRow } from "discord.js";
import Button from "../../interfaces/Button";
import { aboutPages } from "../../utils/aboutPages";

export const button: Button = {
  name: 'guilds-nextPage',

  run: async (client, interaction) => {
    const page = parseInt(((interaction.message.components![0] as MessageActionRow).components[2] as MessageButton).label?.split('/')[0]!) - 1;

    const guildsArray = client.guilds.cache.map(g => g);
    const guild = guildsArray[page + 1];

    const embed = new MessageEmbed()
      .setAuthor({ name: `Lambda bot is in ${client.guilds.cache.size} servers` })
      .setColor(client.colors.embedColor.decimal)
      .setTitle(guild.name)
      .setDescription(`
        Name: **${guild!.name}**
        ID: **\`${guild!.id}\`**
        Description: **${guild!.description || "None"}**
        Icon: **${guild!.iconURL({ dynamic: true }) ? '[Click here](' + guild!.iconURL({ dynamic: true }) + ')' : "None"}**
        Owner: **${guild!.members.cache.get(guild!.ownerId)?.user.tag} (\`${guild!.ownerId}\`)**
      `.substring(0, 4096))
      .addField('Miscellaneous', `
        Server Boosts: **${guild!.premiumSubscriptionCount ?? 0} Boosts**
        Verification Level: **${guild!.verificationLevel === 'LOW' ? 'Low' : guild!.verificationLevel === 'HIGH' ? 'High' : guild!.verificationLevel === 'MEDIUM' ? 'Medium' : guild!.verificationLevel === 'NONE' ? 'Disabled' : 'Very High'}**
        Explicit Content Filter: **${guild!.explicitContentFilter === 'DISABLED' ? 'Disabled' : guild!.explicitContentFilter === 'ALL_MEMBERS' ? 'Everyone' : 'Members Without Roles'}**
        Created At: **<t:${parseInt(String(guild!.createdTimestamp / 1000))}:F> (<t:${parseInt(String(guild!.createdTimestamp / 1000))}:R>)**
      `.substring(0, 1024))
      .addField('Channels', `
        Total Channels: **${guild!.channels.cache.filter(c => ['GUILD_NEWS', 'GUILD_TEXT', 'GUILD_VOICE', 'GUILD_STAGE_VOICE'].includes(c.type)).size}**
        Text Channels: **${guild!.channels.cache.filter(c => c.type === 'GUILD_TEXT').size}**
        Announcements Channels: **${guild!.channels.cache.filter(c => c.type === 'GUILD_NEWS').size}**
        Voice Channels: **${guild!.channels.cache.filter(c => c.type === 'GUILD_VOICE').size}**
        Stage Channels: **${guild!.channels.cache.filter(c => c.type === 'GUILD_STAGE_VOICE').size}**
        Categories: **${guild!.channels.cache.filter(c => c.type === 'GUILD_CATEGORY').size}**
      `.substring(0, 1024))
      .addField('Members', `
        Total Members: **${guild!.memberCount}**
        Online Members: **${guild!.members.cache.filter(m => m.presence?.status === 'online').size}**
        Idling Members: **${guild!.members.cache.filter(m => m.presence?.status === 'idle').size}**
        Do Not Disturb Members: **${guild!.members.cache.filter(m => m.presence?.status === 'dnd').size}**
        Offline Members: **${guild!.members.cache.filter(m => m.presence?.status === 'offline').size}**
      `.substring(0, 1024))
      .addField('Roles', `
        ${guild!.roles.cache.filter(r => r.name !== '@everyone').map(r => `@${r.name}`).join(' ') || 'No roles'}
      `.substring(0, 1024))
      .addField('Emojis', `
        ${guild!.emojis.cache.map(e => e.animated ? '<a:' + e.name + ':' + e.id + '>' : '<:' + e.name + ':' + e.id + '>').join(' ') + ' ' || 'No emojis'}
      `.substring(0, 1024))

    return await interaction.update({
      embeds: [embed],
      components: [
        new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setEmoji(client.customEmojis.pagination.firstPage)
              .setStyle('SECONDARY')
              .setCustomId('guilds-firstPage')
              .setDisabled(guild.id === guildsArray[0].id),
            new MessageButton()
              .setEmoji(client.customEmojis.pagination.previousPage)
              .setStyle('SECONDARY')
              .setCustomId('guilds-previousPage')
              .setDisabled(guild.id === guildsArray[0].id),
            new MessageButton()
              .setLabel(`${guildsArray.findIndex(g => g.id === guild.id) + 1}/${guildsArray.length}`)
              .setCustomId('guilds-pageNumber')
              .setStyle('SECONDARY')
              .setDisabled(true),
            new MessageButton()
              .setEmoji(client.customEmojis.pagination.nextPage)
              .setStyle('SECONDARY')
              .setCustomId('guilds-nextPage')
              .setDisabled(guild.id === guildsArray[guildsArray.length - 1].id),
            new MessageButton()
              .setEmoji(client.customEmojis.pagination.lastPage)
              .setStyle('SECONDARY')
              .setCustomId('guilds-lastPage')
              .setDisabled(guild.id === guildsArray[guildsArray.length - 1].id)
          )
      ]
    });
  },
}