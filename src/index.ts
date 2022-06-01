import { config } from "dotenv";
import Client from "./structures/Client";
import "./utils/errorHandleSystem";

config();

export const client = new Client({
    intents: 38855,
});

client.init().catch(console.error);