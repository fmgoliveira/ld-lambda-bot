import { Collection, Client } from "discord.js";
import Button from "../interfaces/Button";
import Command from "../interfaces/Command";
import { Event } from "../interfaces/Event";
import SelectMenu from "../interfaces/SelectMenu";
import path from 'path';
import fs from 'fs';
import { CommandInteraction } from "discord.js";
import { Cooldown } from "../interfaces/Cooldown";
import { WebhookClient } from "discord.js";
import { ExtendedGiveawaysManager } from "./GiveawaySystem";
import User from "../database/models/User";
import { Player } from 'discord-player';
import MusicSystem from "./MusicSystem";
import commands from "../utils/commands.json";
import Modal from "../interfaces/Modal";
import Levels from 'discord-xp';
import { webServerInit } from "./webServer";

export default class ExtendedClient extends Client {
  public commands: Collection<string, Command> = new Collection();
  public events: Collection<string, Event> = new Collection();
  public buttons: Collection<string, Button> = new Collection();
  public selectMenus: Collection<string, SelectMenu> = new Collection();
  public modals: Collection<string, Modal> = new Collection();
  public cooldowns: Collection<string, Cooldown> = new Collection();

  public colors = {
    mainColor: { hex: '#ffa826', decimal: 16754726 },
    embedColor: { hex: '#2f3136', decimal: 3092790 },
    error: { hex: '#ed4245', decimal: 15548997 },
    success: { hex: '#00ff00', decimal: 5763720 },
  };
  public embedFooter = { text: 'Lambda Bot', iconURL: 'https://cdn.discordapp.com/avatars/900398063607242762/a641a1d2197555beb972db5a235e5749.webp' };
  public customEmojisUrl = {
    error: 'https://cdn.discordapp.com/emojis/968925526322466906.webp?size=512&quality=lossless',
    success: 'https://cdn.discordapp.com/emojis/968925766261813278.webp?size=512&quality=lossless',
    giveaway: 'https://cdn.discordapp.com/emojis/971765545596756040.webp?size=512&quality=lossless',
    blacklisted: 'https://cdn.discordapp.com/emojis/974710006345789523.webp?size=512&quality=lossless',
    music: 'https://cdn.discordapp.com/emojis/974698590633087006.webp?size=512&quality=lossless',
    tickets: 'https://cdn.discordapp.com/emojis/976527499511091210.webp?size=512&quality=lossless',
    levels: 'https://cdn.discordapp.com/emojis/977852860052152330.webp?size=512&quality=lossless',
  }
  public customEmojis = {
    botLogo: '<:bot_logo:969278030876921907>',
    companyLogo: '<:company_logo:969280377908768789>',
    success: '<:success:968925766261813278>',
    error: '<:error:968925526322466906>',
    support: '<:support:969286643578187786>',
    invite: '<:invite:969632054507614298>',
    giveaway: '<:giveaway:971765545596756040>',
    music: '<:music:974698590633087006>',
    pagination: {
      firstPage: '<:first_page:969265884084437002>',
      lastPage: '<:last_page:969265884189306952>',
      previousPage: '<:previous_page:969265884088655912>',
      nextPage: '<:next_page:969265884017344603>',
    },
    modules: {
      about: '<:about:969286603174461450>',
      general: '<:general:969305245874290759>',
      admin: '<:admin:970370214132854864>',
      bugs: '<:reported:974666128230068284>',
      music: '<:music:974698590633087006>',
      moderation: '<:moderation:976527499519475762>',
      tickets: '<:tickets_:976527499511091210>',
      levels: '<:levels:977852860052152330>',
      fun: '<:fun:977852859951505449>',
      utility: '<:utility:977852859813089320>'
    },
    inProgress: '<:in_progress:974666128251047966>',
    rejected: '<:rejected:974666128251043880>',
    reported: '<:reported:974666128230068284>',
    blacklisted: '<:blacklisted:974710006345789523>',
    loading: '<a:spinner:975660356712136754>',
    repeatQueue: '<:repeat_queue:975720016383201330>',
    repeatTrack: '<:repeat_track:975720016479662090>',
    shuffle: '<:shuffle:975721260627681321>',
    play: '<:play:976122967882866700>',
    pause: '<:pause:976122967929004084>',
    stop: '<:stop:976122968189046784>',
    queue: '<:queue:976122968247767143>',
    skip: '<:skip:976122968138735626>',
    close: '<:close:977214264026746972>',
    lock: '<:lock_:977214263926083655>',
    unlock: '<:unlock_:977214264345522206>',
    claim: '<:claim:977214264362287124>',
    unclaim: '<:unclaim:977214264198692864>',
    delete: '<:delete:977214264349700207>',
    transcript: '<:transcript:977214264219689012>',
  };
  public mainGuildLink = 'https://discord.gg/zqBF8Wv5Pg';
  public inviteLink = `https://discord.com/api/oauth2/authorize?client_id=900398063607242762&permissions=1374862962039&redirect_uri=https%3A%2F%2Fdiscord.gg%2FzqBF8Wv5Pg&response_type=code&scope=bot%20applications.commands`;

  public modulesMapping = [
    { label: 'General Commands Module', value: 'general', emoji: this.customEmojis.modules.general, description: 'This module contains all the general commands that are not related to any specific module.' },
    { label: 'Server Management Module', value: 'admin', emoji: this.customEmojis.modules.admin, description: 'This module contains the commands you can use to manage your server.' },
    { label: 'Music Module', value: 'music', emoji: this.customEmojis.modules.music, description: 'This module contains the commands you can use to listen to music in your server.' },
    { label: 'Fun Module', value: 'fun', emoji: this.customEmojis.modules.fun, description: 'This module contains the commands you can use to have fun in your server.' },
    { label: 'Moderation Module', value: 'moderation', emoji: this.customEmojis.modules.moderation, description: 'This module contains the commands you can use to moderate your server.' },
    { label: 'Tickets Module', value: 'tickets', emoji: this.customEmojis.modules.tickets, description: 'This module contains the commands you can use to manage the ticket system in your server.' },
    { label: 'Levels Module', value: 'levels', emoji: this.customEmojis.modules.levels, description: 'This module contains the commands you can use to manage the levelling & xp system in your server.' },
    { label: 'Utility Module', value: 'utility', emoji: this.customEmojis.modules.utility, description: 'This module contains the commands such as userinfo and serverinfo.' },
    { label: 'Bug Reports Module', value: 'bugs', emoji: this.customEmojis.modules.bugs, description: 'This module contains the commands you can use to report and see the reported bugs.' },
  ]

  public commandsMapping: string[] = commands.sort();

  public webhooks = {
    bot: new WebhookClient({
      url: process.env.BOT_WEBHOOK_URL!,
    }),
    errors: new WebhookClient({
      url: process.env.ERRORS_WEBHOOK_URL!,
    }),
  };

  public giveawaysManager = new ExtendedGiveawaysManager(this, {
    default: {
      botsCanWin: false,
      embedColor: this.colors.embedColor.decimal,
      embedColorEnd: this.colors.error.decimal,
      reaction: this.customEmojis.giveaway,
      exemptMembers: async (member) => (await User.find({})).filter((m) => m.blacklisted).map((m) => m.id).includes(member.id),
      lastChance: {
        embedColor: this.colors.mainColor.decimal,
        enabled: true,
        content: '⚠️ **LAST CHANCE TO ENTER** ⚠️',
        threshold: 60000,
      },
    },
    endedGiveawaysLifetime: 1000 * 60 * 60 * 24 * 30,
    forceUpdateEvery: 1000 * 60 * 60 * 6,
  });

  public musicPlayer = new Player(this, {
    ytdlOptions: {
      highWaterMark: 1 << 25,
      quality: 'highestaudio',
    }
  });

  public async init(): Promise<void> {
    await this.login(process.env.BOT_TOKEN);

    // Commands
    const commandsPath = path.join(__dirname, "..", "commands");
    fs.readdirSync(commandsPath, { withFileTypes: true }).filter((dir) => !dir.isFile()).map((dir) => dir.name).forEach(async (dir) => {
      const commands = fs.readdirSync(`${commandsPath}/${dir}`).filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

      for (const file of commands) {
        const { command } = await import(`${commandsPath}/${dir}/${file}`);
        this.commands.set(command.name, command);
      }
    });

    // Events
    const eventsPath = path.join(__dirname, "..", "events");
    fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js') || file.endsWith('.ts')).forEach(async (file) => {
      const { event } = await import(`${eventsPath}/${file}`);
      this.events.set(event.name, event);

      if (event.once) this.once(event.name, event.run.bind(null, this));
      else this.on(event.name, event.run.bind(null, this));
    });

    // Buttons
    const buttonsPath = path.join(__dirname, "..", "buttons");
    fs.readdirSync(buttonsPath, { withFileTypes: true }).filter((dir) => !dir.isFile()).map((dir) => dir.name).forEach(async (dir) => {
      const buttons = fs.readdirSync(`${buttonsPath}/${dir}`).filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

      for (const file of buttons) {
        const { button } = await import(`${buttonsPath}/${dir}/${file}`);
        this.buttons.set(button.name, button);
      }
    });

    // Select Menus
    const selectMenuPath = path.join(__dirname, "..", "selectMenus");
    fs.readdirSync(selectMenuPath, { withFileTypes: true }).filter((dir) => !dir.isFile()).map((dir) => dir.name).forEach(async (dir) => {
      const selectMenus = fs.readdirSync(`${selectMenuPath}/${dir}`).filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

      for (const file of selectMenus) {
        const { selectMenu } = await import(`${selectMenuPath}/${dir}/${file}`);
        this.selectMenus.set(selectMenu.name, selectMenu);
      }
    });

    // Modals
    const modalsPath = path.join(__dirname, "..", "modals");
    fs.readdirSync(modalsPath, { withFileTypes: true }).filter((dir) => !dir.isFile()).map((dir) => dir.name).forEach(async (dir) => {
      const modals = fs.readdirSync(`${modalsPath}/${dir}`).filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

      for (const file of modals) {
        const { modal } = await import(`${modalsPath}/${dir}/${file}`);
        this.modals.set(modal.name, modal);
      }
    });

    // Music Player Listeners
    MusicSystem(this);

    // Database
    require('../database');

    // Levels System
    Levels.setURL(process.env.MONGODB_URL!);

    // WebServer
    webServerInit(parseInt(process.env.PORT || '3000'));
  }

  public async commandFailed(interaction: CommandInteraction): Promise<void> {
    return interaction.reply({
      embeds: [
        {
          author: { name: 'The execution of the command failed.', iconURL: this.customEmojisUrl.error },
          description: `Try again and, if the error persists, contact the Team at the **[Support Server](${this.mainGuildLink})**.`,
          color: this.colors.error.decimal,
        }
      ],
      ephemeral: true
    })
  }
}