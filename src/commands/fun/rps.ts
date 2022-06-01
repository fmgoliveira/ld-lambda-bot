import { MessageEmbed } from "discord.js";
import Command from "../../interfaces/Command";

export const command: Command = {
  name: "rps",
  description: "Play rock, paper, scissors with the bot",
  options: [
    {
      name: 'choice',
      description: 'The choice you want to make',
      required: true,
      type: 3,
      choices: [
        {
          name: 'Rock',
          value: 'rock'
        },
        {
          name: 'Paper',
          value: 'paper'
        },
        {
          name: 'Scissors',
          value: 'scissors'
        }
      ]
    },
  ],
  usage: ['rps <choice>'],
  category: "fun",
  dmOnly: false,
  guildOnly: false,
  cooldown: 3,
  ephemeralReply: true,

  run: async (client, interaction) => {
    const choice = interaction.options.getString('choice') as 'rock' | 'paper' | 'scissors';
    const botPlay = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)] as 'rock' | 'paper' | 'scissors';

    const win = (a: 'rock' | 'paper' | 'scissors', b: 'rock' | 'paper' | 'scissors') => {
      if (a === b) return 'draw';
      if (a === 'rock') return b === 'scissors' ? 'rock' : 'paper';
      if (a === 'paper') return b === 'rock' ? 'paper' : 'scissors';
      if (a === 'scissors') return b === 'paper' ? 'scissors' : 'rock';
    };

    const res = win(botPlay, choice);
    const whoWon = res === 'draw' ? 'draw' : res === choice ? 'you' : 'bot';

    const embed = new MessageEmbed()
      .setColor(client.colors.embedColor.decimal)
      .setDescription(`You played **${choice}**, the bot played **${botPlay}**. **${whoWon === 'draw' ? 'It\'s a draw!' : `${whoWon} won!`}**`);
      
    await interaction.editReply({
      embeds: [embed]
    });
  }
}