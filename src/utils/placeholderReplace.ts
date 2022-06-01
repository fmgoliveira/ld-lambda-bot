import { Guild, User } from "discord.js"

export default (string: string, guild: Guild, user: User | null = null) => {
  let temp = string

  if (user) {
    temp = temp.replace("{user}", `<@${user.id}>`)
    temp = temp.replace("{user_tag}", `${user.tag}`)
    temp = temp.replace("{user_name}", `${user.username}`)
    temp = temp.replace("{user_id}", `${user.id}`)
  }

  temp = temp.replace("{guild}", `${guild.name}`)
  temp = temp.replace("{guild_name}", `${guild.name}`)
  temp = temp.replace("{memberCount}", `${guild.memberCount}`)
  temp = temp.replace("{size}", `${guild.memberCount}`)
  temp = temp.replace("{guild_id}", `${guild.id}`)

  return temp
}