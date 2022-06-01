import { GuildMember } from "discord.js";
import { ButtonInteraction } from "discord.js";
import Client from "../structures/Client";

export interface ExtendedButtonInteraction extends ButtonInteraction {
  member: GuildMember;
}

type Run = (client: Client, interaction: ExtendedButtonInteraction) => void;

export default interface Button {
  name: string;
  reply?: boolean;
  ephemeralReply?: boolean;
  denyDeferReply?: boolean;
  run: Run;
}