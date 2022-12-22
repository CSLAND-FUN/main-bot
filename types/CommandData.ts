import { CommandCategory } from "@src/classes/Command";
import { PermissionsString } from "discord.js";

export interface CommandData {
  category: CommandCategory;
  name: string;

  description?: string;
  aliases?: string[];
  ownerOnly?: boolean;
  cooldown?: number;

  permissions?: PermissionsString[];
}
