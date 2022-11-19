import { ColorResolvable, EmbedBuilder, Message } from "discord.js";
import { CommandData } from "../../types/CommandData";
import DiscordBot from "./Discord";

export enum CommandCategory {
  LOBBY = "LOBBY",
  BONUSES = "BONUSES",
  OTHER = "OTHER",
  MODERATION = "MODERATION",
  MUSIC = "MUSIC",
  OWNER = "OWNER",
}

export class Command {
  readonly data: CommandData;

  constructor(data: CommandData) {
    this.data = data;

    this.data.description = this.data.description ?? "Без описания.";
  }

  run(client: DiscordBot, message: Message, args: string[]) {
    throw new Error(
      `Command#run is not implemented in "${this.data.name}" Command!`
    );
  }

  embed(
    client: DiscordBot,
    message: Message,
    color: ColorResolvable,
    author: "bot" | "user",
    content: string
  ) {
    return new EmbedBuilder()
      .setColor(color)
      .setAuthor(
        author === "bot"
          ? {
              name: client.user.tag,
              iconURL: client.user.avatarURL({ size: 2048, forceStatic: true }),
            }
          : {
              name: message.author.tag,
              iconURL: message.author.avatarURL({
                size: 2048,
                forceStatic: true,
              }),
            }
      )
      .setDescription(content);
  }
}
