import {
  ColorResolvable,
  EmbedBuilder,
  Message,
  PermissionsString,
} from "discord.js";
import DiscordBot from "./Discord";
import Logger from "./Logger";

interface CommandData {
  category: CommandCategory;
  name: string;

  description?: string;
  aliases?: string[];
  cooldown?: number;

  ownerOnly?: boolean;
  disabled?: boolean;

  permissions?: PermissionsString[];
}

export enum CommandCategory {
  LOBBY = "LOBBY",
  BONUSES = "BONUSES",
  OTHER = "OTHER",
  MODERATION = "MODERATION",
  MUSIC = "MUSIC",
  OWNER = "OWNER",
  CLANS = "CLANS",
  PROMOCODES = "PROMOCODES",
}

export class Command {
  readonly data: CommandData;

  constructor(data: CommandData) {
    this.data = data;

    this.data.description = this.data.description ?? "Без описания.";
    this.data.cooldown = this.data.cooldown ?? null;
    this.data.disabled = this.data.disabled ?? false;
  }

  run(client: DiscordBot, message: Message, args: string[]) {
    return Logger.error(
      `Command#run is not implemented in "${this.data.name}" Command!`,
      "Command"
    );
  }

  embed(color: ColorResolvable, content: string, emoji?: string) {
    return new EmbedBuilder()
      .setColor(color)
      .setDescription(
        typeof emoji !== "undefined" ? `${emoji} | ${content}` : content
      );
  }
}
