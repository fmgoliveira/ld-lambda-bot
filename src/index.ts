import { config } from "dotenv";
import Client from "./structures/Client";

config();

import "./utils/errorHandleSystem";

export const client = new Client({
    intents: 38855,
});

client.init().catch(console.error);