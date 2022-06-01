import { ApplicationCommandOptionData } from "discord.js";
import { GuildMember } from "discord.js";
import { CommandInteraction, PermissionResolvable } from "discord.js";
import Client from "../structures/Client";

export interface ExtendedCommandInteraction extends CommandInteraction {
  member: GuildMember;
}

type Run = (client: Client, interaction: ExtendedCommandInteraction) => void;

export default interface Command {
  cooldown?: number;
  cooldownResponse?: string;
  name: string;
  description: string;
  devOnly?: boolean;
  staffOnly?: boolean;
  botAdminOnly?: boolean;
  dmOnly: boolean;
  guildOnly: boolean;
  options?: ApplicationCommandOptionData[];
  defaultPermission?: boolean;
  ephemeralReply?: boolean;
  denyDeferReply?: boolean;
  userPermissions?: PermissionResolvable[];
  botPermissions?: PermissionResolvable[];
  usage?: string[];
  category: string;
  votedOnly?: boolean;
  run: Run;
}