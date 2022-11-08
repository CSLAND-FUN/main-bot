import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import Functions from "@src/classes/Functions";
import { Message } from "discord.js";

import config from "@cfg";

export = class StatsCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.BONUSES,
      name: "stats",

      description: "Показывает вашу статистику в Бонусной Системе.",
      aliases: ["bonuses"],
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const data = await client.bonuses.data(message.author.id);
    const word = Functions.declOfNum(data.bonuses, [
      "бонус",
      "бонуса",
      "бонусов",
    ]);

    const res = [];
    res.push(`› **Баланс**: **${data.bonuses.toLocaleString("be")} ${word}**`);
    res.push(
      `› **Купленные роли**: **${await this.getRoles(client, data.id)}**`
    );

    if (data.blacklisted === 1) {
      res.push("");
      res.push("⚠️ | **Вы внесены в чёрный список бонусной системы!**");
      res.push(`**Причина: ${data.reason}**`);
    }

    const embed = this.embed(
      client,
      message,
      "DarkPurple",
      "user",
      res.join("\n")
    );

    return message.reply({
      embeds: [embed],
    });
  }

  async getRoles(client: DiscordBot, id: string): Promise<string> {
    const data = await client.bonuses.data(id);
    if (!data.roles) return "Отсутствуют";

    const out = [];
    for (const _role of data.roles) {
      const role = config.ROLES.find((x) => x.role_num === Number(_role));
      out.push(role.role_name);
    }

    return out.join(", ");
  }
};
