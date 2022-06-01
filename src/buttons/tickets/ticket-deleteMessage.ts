import Button from '../../interfaces/Button';
import { Message } from 'discord.js';

export const button: Button = {
  name: 'ticket-deleteMessage',

  run: async (client, interaction) => {
    await (interaction.message as Message).delete().catch(() => {});
  }
}
