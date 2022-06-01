import { GuildMember } from "discord.js";
import { SelectMenuInteraction } from "discord.js";
import Client from "../structures/Client";

export interface ExtendedSelectMenuInteraction extends SelectMenuInteraction {
  member: GuildMember;
}

type Run = (client: Client, interaction: ExtendedSelectMenuInteraction) => void;

export default interface SelectMenu {
  name: string;
  reply?: boolean;
  ephemeralReply?: boolean;
  denyDeferReply?: boolean;
  run: Run;
}