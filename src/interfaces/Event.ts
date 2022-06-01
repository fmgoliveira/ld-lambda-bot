import { ClientEvents } from "discord.js";
import Client from "../structures/Client";

type Run = (client: Client, ...args: any[]) => void;

export interface Event {
  name: keyof ClientEvents;
  once?: boolean;
  run: Run;
}