import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";
import { MessageEmbed } from "discord.js";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: "guilds",
  description: "Show all the servers the bot is in",
  options: [
    {
      name: 'guild_id',
      description: 'The guild id to get info on',
      required: false,
      type: 3
    }
  ],
  botAdminOnly: true,
  guildOnly: false,
  dmOnly: false,
  category: 'dev',

  run: async (client, interaction) => {
    const guildId = interaction.options.getString('guild_id');
    const guilds = client.guilds.cache;
    const guild = guildId ? guilds.get(guildId) : guilds.first();
    if (!guild) return interaction.editReply('Guild not found');
    const guildsArray = guilds.map(g => g);

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
        ${guild!.roles.cache.filter(r => r.name !== '@everyone').map(r => `@${r.name}`).join(' ')}
      `.substring(0, 1024))
      .addField('Emojis', `
        ${guild!.emojis.cache.map(e => e.animated ? '<a:' + e.name + ':' + e.id + '>' : '<:' + e.name + ':' + e.id + '>').join(' ') + ' '}
      `.substring(0, 1024))

    const buttons = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setEmoji(client.customEmojis.pagination.firstPage)
          .setStyle('SECONDARY')
          .setCustomId('guilds-firstPage')
          .setDisabled(guild.id === guilds.first()!.id),
        new MessageButton()
          .setEmoji(client.customEmojis.pagination.previousPage)
          .setStyle('SECONDARY')
          .setCustomId('guilds-previousPage')
          .setDisabled(guild.id === guilds.first()!.id),
        new MessageButton()
          .setLabel(`${guildsArray.findIndex(g => g.id === guild.id) + 1}/${guildsArray.length}`)
          .setCustomId('guilds-pageNumber')
          .setStyle('SECONDARY')
          .setDisabled(true),
        new MessageButton()
          .setEmoji(client.customEmojis.pagination.nextPage)
          .setStyle('SECONDARY')
          .setCustomId('guilds-nextPage')
          .setDisabled(guild.id === guilds.last()!.id),
        new MessageButton()
          .setEmoji(client.customEmojis.pagination.lastPage)
          .setStyle('SECONDARY')
          .setCustomId('guilds-lastPage')
          .setDisabled(guild.id === guilds.last()!.id)
      )

    await interaction.editReply({ embeds: [embed], components: [buttons] });

    setTimeout(async () => {
      await interaction.editReply({ components: [] });
    }, 60 * 60 * 1000);
  }
};