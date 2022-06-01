import { MessageEmbed } from "discord.js";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: "serverinfo",
  description: "Get information about the server",
  category: "utility",
  dmOnly: false,
  guildOnly: true,
  cooldown: 3,
  ephemeralReply: true,

  run: async (client, interaction) => {
    const embed = new MessageEmbed()
      .setColor(client.colors.embedColor.decimal)
      .setAuthor({ name: interaction.guild!.name, iconURL: interaction.guild!.iconURL({ dynamic: true }) || undefined })
      .setDescription(`
        Name: **${interaction.guild!.name}**
        ID: **\`${interaction.guild!.id}\`**
        Description: **${interaction.guild!.description || "None"}**
        Icon: **${interaction.guild!.iconURL({ dynamic: true }) ? '[Click here](' + interaction.guild!.iconURL({ dynamic: true }) + ')' : "None"}**
        Owner: **<@${interaction.guild!.members.cache.get(interaction.guild!.ownerId)?.id}> (\`${interaction.guild!.ownerId}\`)**
      `.substring(0, 4096))
      .addField('Miscellaneous', `
        Server Boosts: **${interaction.guild!.premiumSubscriptionCount ?? 0} Boosts**
        Verification Level: **${interaction.guild!.verificationLevel === 'LOW' ? 'Low' : interaction.guild!.verificationLevel === 'HIGH' ? 'High' : interaction.guild!.verificationLevel === 'MEDIUM' ? 'Medium' : interaction.guild!.verificationLevel === 'NONE' ? 'Disabled' : 'Very High'}**
        Explicit Content Filter: **${interaction.guild!.explicitContentFilter === 'DISABLED' ? 'Disabled' : interaction.guild!.explicitContentFilter === 'ALL_MEMBERS' ? 'Everyone' : 'Members Without Roles'}**
        Created At: **<t:${parseInt(String(interaction.guild!.createdTimestamp / 1000))}:F> (<t:${parseInt(String(interaction.guild!.createdTimestamp / 1000))}:R>)**
      `.substring(0, 1024))
      .addField('Channels', `
        Total Channels: **${interaction.guild!.channels.cache.filter(c => ['GUILD_NEWS', 'GUILD_TEXT', 'GUILD_VOICE', 'GUILD_STAGE_VOICE'].includes(c.type)).size}**
        Text Channels: **${interaction.guild!.channels.cache.filter(c => c.type === 'GUILD_TEXT').size}**
        Announcements Channels: **${interaction.guild!.channels.cache.filter(c => c.type === 'GUILD_NEWS').size}**
        Voice Channels: **${interaction.guild!.channels.cache.filter(c => c.type === 'GUILD_VOICE').size}**
        Stage Channels: **${interaction.guild!.channels.cache.filter(c => c.type === 'GUILD_STAGE_VOICE').size}**
        Categories: **${interaction.guild!.channels.cache.filter(c => c.type === 'GUILD_CATEGORY').size}**
      `.substring(0, 1024))
      .addField('Members', `
        Total Members: **${interaction.guild!.memberCount}**
        Online Members: **${interaction.guild!.members.cache.filter(m => m.presence?.status === 'online').size}**
        Idling Members: **${interaction.guild!.members.cache.filter(m => m.presence?.status === 'idle').size}**
        Do Not Disturb Members: **${interaction.guild!.members.cache.filter(m => m.presence?.status === 'dnd').size}**
        Offline Members: **${interaction.guild!.members.cache.filter(m => m.presence?.status === 'offline').size}**
      `.substring(0, 1024))
      .addField('Roles', `
        ${interaction.guild!.roles.cache.filter(r => r.name !== '@everyone').map(r => `<@&${r.id}>`).join(' ')}
      `.substring(0, 1024))
      .addField('Emojis', `
        ${interaction.guild!.emojis.cache.map(e => e.animated ? '<a:' + e.name + ':' + e.id + '>' : '<:' + e.name + ':' + e.id + '>').join(' ') + ' '}
      `.substring(0, 1024))

    if (interaction.guild!.iconURL({ dynamic: true }) !== null) embed.setThumbnail(interaction.guild!.iconURL({ dynamic: true })!);

    await interaction.editReply({
      embeds: [embed]
    });
  }
}