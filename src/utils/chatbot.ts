import { Message } from "discord.js";
import axios from "axios";

export const chatSend = async (message: Message) => {
  try {
    let bid = process.env.BRAINSHOP_BID!;
    let key = process.env.BRAINSHOP_KEY!;
    let uid = "1";

    let msg = message.content;
    message.mentions.users.forEach((u) => {
      msg = message.content.replace(`<@${u.id}>`, u.username);
    });

    await axios.get(`https://api.brainshop.ai/get?bid=${bid}&key=${key}&uid=${uid}&msg=${msg}`).then(async (res) => {
      const data = res.data;
      const reply = data.cnt;

      if (reply) await message.reply({
        content: reply,
        allowedMentions: {
          repliedUser: false,
        },
      });
      else await message.reply({
        content: 'API did not respond at time: **[TIME OUT]**',
        allowedMentions: {
          repliedUser: false,
        },
      });
    })
  } catch (e) { console.log(e) }
}