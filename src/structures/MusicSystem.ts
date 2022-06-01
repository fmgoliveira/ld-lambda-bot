import { MessageActionRow } from "discord.js";
import { MessageButton } from "discord.js";
import { TextChannel } from "discord.js";
import ExtendedClient from "./Client";

export default (client: ExtendedClient) => {
  client.musicPlayer.on('trackStart', async (queue, track) => {
    const message = await (queue.metadata as { channel: TextChannel }).channel.send({
      embeds: [
        {
          author: {
            name: `Lambda Music System`,
            iconURL: client.customEmojisUrl.music,
          },
          description: `Now playing **${track.title}** from ${track.author}.`,
          image: { url: track.thumbnail },
          color: client.colors.embedColor.decimal,
        }
      ],
      components: [
        new MessageActionRow()
          .setComponents(
            new MessageButton()
              .setCustomId('music-pause')
              .setEmoji(client.customEmojis.pause)
              .setStyle('SECONDARY'),
            new MessageButton()
              .setCustomId('music-stop')
              .setEmoji(client.customEmojis.stop)
              .setStyle('SECONDARY'),
            new MessageButton()
              .setCustomId('music-skip')
              .setEmoji(client.customEmojis.skip)
              .setStyle('SECONDARY'),
            new MessageButton()
              .setCustomId('music-queue')
              .setEmoji(client.customEmojis.queue)
              .setStyle('SECONDARY'),
            new MessageButton()
              .setCustomId('music-shuffle')
              .setEmoji(client.customEmojis.shuffle)
              .setStyle('SECONDARY'),
          )
      ]
    });

    if (track.durationMS) setTimeout(() => {
      message.edit({
        components: []
      }).catch(() => { });
    }, track.durationMS);
  });

  client.musicPlayer.on('queueEnd', (queue) => {
    (queue.metadata as any).channel.send({
      embeds: [
        {
          author: {
            name: `Lambda Music System`,
            iconURL: client.customEmojisUrl.music,
          },
          description: `Finished playing all the requested songs. *Leaving the channel...*`,
          color: client.colors.embedColor.decimal,
        }
      ],
    });
  });

  client.musicPlayer.on('channelEmpty', (queue) => {
    (queue.metadata as any).channel.send({
      embeds: [
        {
          author: {
            name: `Lambda Music System`,
            iconURL: client.customEmojisUrl.music,
          },
          description: `Voice Channel is empty. *Leaving the channel...*`,
          color: client.colors.embedColor.decimal,
        }
      ],
    });

    queue.clear();
  });

  client.musicPlayer.on('error', (queue, error) => {
    (queue.metadata as any).channel.send({
      embeds: [
        {
          author: {
            name: `Lambda Music System`,
            iconURL: client.customEmojisUrl.music,
          },
          description: `Error emitted from the queue.\n\`\`\`${error.message}\`\`\``,
          color: client.colors.embedColor.decimal,
        }
      ],
    });
  });

  client.musicPlayer.on('connectionError', (queue, error) => {
    (queue.metadata as any).channel.send({
      embeds: [
        {
          author: {
            name: `Lambda Music System`,
            iconURL: client.customEmojisUrl.music,
          },
          description: `Error emitted from the connection.\n\`\`\`${error.message}\`\`\``,
          color: client.colors.embedColor.decimal,
        }
      ],
    });
  });

  client.musicPlayer.on('botDisconnect', (queue) => {
    (queue.metadata as any).channel.send({
      embeds: [
        {
          author: {
            name: `Lambda Music System`,
            iconURL: client.customEmojisUrl.music,
          },
          description: `Disconnected from Voice Channel. *Clearing the queue...*`,
          color: client.colors.embedColor.decimal,
        }
      ],
    });

    queue.clear();
  });
};