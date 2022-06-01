import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";
import { TextChannel } from "discord.js";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: "createinvite",
  description: "Creates a temporary invite for a server",
  options: [
    {
      name: 'guild_id',
      description: 'The guild id to create the invite on',
      required: true,
      type: 3
    }
  ],
  botAdminOnly: true,
  guildOnly: false,
  dmOnly: false,
  category: 'dev',

  run: async (client, interaction) => {
    const guildId = interaction.options.getString('guild_id')!;
    const guilds = client.guilds.cache;
    const guild = guilds.get(guildId);
    if (!guild) return await interaction.editReply('Guild not found');

    let url: string = '';
    const invite = await (guild.channels.cache.filter(c => c.type === 'GUILD_TEXT').first() as TextChannel | undefined)?.createInvite({
      maxAge: 30
    }).then(invite => { url = invite.url }).catch(async () => { return await interaction.editReply('Failed to create invite') });

    const buttons = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Join Server')
          .setURL(url)
          .setStyle('LINK')
      )

    await interaction.editReply({ content: `**Invite created** | Click the button below to join the server. \n*You only have \`30 seconds\` to do this, after that time the invite will be deleted.*`, components: [buttons] });

    setTimeout(async () => {
      await interaction.editReply({
        components: [
          new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setLabel('Join Server')
                .setURL(url)
                .setStyle('LINK')
                .setDisabled(true)
            )
        ]
      });
    }, 60 * 60 * 1000);
  }
};