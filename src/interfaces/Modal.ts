import { GuildMember } from "discord.js";
import { ModalSubmitInteraction } from "discord.js";
import Client from "../structures/Client";

export interface ExtendedModalSubmitInteraction extends ModalSubmitInteraction {
  member: GuildMember;
}

type Run = (client: Client, interaction: ExtendedModalSubmitInteraction) => void;

export default interface Modal {
  name: string;
  reply?: boolean;
  ephemeralReply?: boolean;
  denyDeferReply?: boolean;
  run: Run;
}