import { Client, Guild } from "discord.js";

/**
 * Used to get a guild using fetch
 * @param {string} guildId The Guild's ID
 * @param {Client} client the Client Instance
*  @returns Client
 */
export async function getGuild(guildId: string, client: Client): Promise<Guild | null> {
    try {
        return await client.guilds.fetch(guildId);
    } catch (e) {
        return null;
    }
}