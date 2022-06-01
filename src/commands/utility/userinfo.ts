import { MessageEmbed } from "discord.js";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: "userinfo",
  description: "Get information about a user",
  category: "utility",
  usage: ['userinfo <target>'],
  options: [
    {
      name: 'target',
      description: 'The user to get information about',
      required: true,
      type: 6
    }
  ],
  dmOnly: false,
  guildOnly: true,
  cooldown: 3,
  ephemeralReply: true,

  run: async (client, interaction) => {
    const user = interaction.options.getUser('target')!;
    const member = interaction.guild!.members.cache.get(user.id);

    const { id, bot, username, discriminator } = user;
    const avatar = user.displayAvatarURL({ dynamic: true, size: 512 });
    let staff = false;
    let dev = false;
    let owner = false;
    let voted = false;
    let booster = false;
    let roles = '';
    let status = '';
    let statusStr = '';
    let roleCount = 0;
    let botOwner = false;

    try {
      statusStr = member?.presence?.status || 'offline';
    } catch {
      statusStr = 'offline'
    }

    if (statusStr === 'online') status = '<:status_green:906087473627668490> Online'
    if (statusStr === 'dnd') status = '<:status_red:906087602447335424> Do Not Disturb'
    if (statusStr === 'idle') status = '<:status_yellow:906087532356304906> Idle'
    if (statusStr === 'offline') status = '<:status_grey:916358227027980328> Offline'

    member?.roles.cache.forEach(role => {
      if (role.name !== 'everyone') roles += `<@&${role.id}> `;
      roleCount++;
    });
    roleCount--;

    if (roleCount === 0) roles = 'The user has no roles in this server';
    if (id === '549619189271494676') botOwner = true;

    if (client.guilds.cache.get(process.env.MAIN_GUILD!)!.members.cache.has(id)) {
      const member = client.guilds.cache.get(process.env.MAIN_GUILD!)!.members.cache.get(id)!;
      if (member.roles.cache.has(process.env.STAFF!)) staff = true;
      if (member.roles.cache.has(process.env.BOT_DEV!)) dev = true;
      if (member.roles.cache.has(process.env.VOTED!)) voted = true;
    }
    if (id === interaction.guild!.ownerId) owner = true;
    if (client.guilds.cache.get(process.env.DEV_GUILD!)!.members.cache.has(id)) {
      const member = client.guilds.cache.get(process.env.DEV_GUILD!)!.members.cache.get(id)!;
      if (member.roles.cache.has(process.env.BOT_DEV!)) dev = true;
    }
    if (member?.premiumSinceTimestamp) booster = true;

    let acknowledgements = '';

    if (staff) {
      if (acknowledgements === '') acknowledgements += "<:mod:919935193857548308> Lambda Team";
      else acknowledgements += ", <:mod:919935193857548308> Lambda Team";
    }
    if (dev) {
      if (acknowledgements === "") acknowledgements += "<:dev:919935194000154624> Lambda Developer";
      else acknowledgements += ", <:dev:919935194000154624> Lambda Developer";
    }
    if (botOwner) {
      if (acknowledgements === "") acknowledgements += "<:owner:919935193861718036> Bot Owner";
      else acknowledgements += ", <:owner:919935193861718036> Bot Owner";
    }
    if (voted) {
      if (acknowledgements === "") acknowledgements += "<:voted:937668445640724480> Voted";
      else acknowledgements += ", <:voted:937668445640724480> Voted";
    }
    if (owner) {
      if (acknowledgements === "") acknowledgements += "Server Owner";
      else acknowledgements += ", Server Owner";
    }
    if (booster) {
      if (acknowledgements === "") acknowledgements += "Server Booster";
      else acknowledgements += ", Server Booster";
    }

    const embed = new MessageEmbed()
      .setColor(client.colors.embedColor.decimal)
      .setAuthor({ name: username + '#' + discriminator, iconURL: avatar })
      .setDescription(`
        <@${id}>

        Username: **${username}**
        ID: **\`${interaction.guild!.id}\`**
        Icon: **${avatar ? '[Click here](' + avatar + ')' : "None"}**
      `.substring(0, 4096))
      .addField('Miscellaneous', `
        Current Status: **${status}**
        Nickname: **${member?.nickname || username}**
        Currently Playing: **${member?.presence?.activities?.length && member.presence.activities.length > 1 ? member?.presence?.activities?.filter(a => a.name !== 'Custom Status')?.[0]?.name : 'Nothing'}**
        Bot: **${bot ? 'True' : 'False'}**
        `.substring(0, 1024))
      .addField('Timings', `
        Created At: **<t:${parseInt(String(user.createdTimestamp / 1000))}:F> (<t:${parseInt(String(user.createdTimestamp / 1000))}:R>)**
        Joined Server At: **<t:${parseInt(String(member!.joinedTimestamp! / 1000))}:F> (<t:${parseInt(String(member!.joinedTimestamp! / 1000))}:R>)**
      `.substring(0, 1024))
      .addField('Roles', roles.substring(0, 1024))
      .addField('Acknowledgements', (acknowledgements || 'None').substring(0, 1024))

    if (avatar !== null) embed.setThumbnail(avatar!);
    if (staff) embed.setFooter({ text: 'User is in Lambda Team', iconURL: 'https://cdn.lambdadev.xyz/company/branding/logo_bg_blue.png' });

    await interaction.editReply({
      embeds: [embed]
    });
  }
}