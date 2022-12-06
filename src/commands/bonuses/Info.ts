import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import Functions from "@src/classes/Functions";
import { Message } from "discord.js";

import config from "@src/config.json";

const GROUPS = {
  1: "Игрок",
  2: "Модератор",
  3: "Тех. Поддержка",
  4: "Мл. Администратор",
  5: "Ст. Администратор",
  6: "Скриптер",
  7: "Гл. Администратор",
  8: "Руководитель",
};

export = class InfoCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.BONUSES,
      name: "info",

      description: "Выводит вашу информацию.",
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const { id, bonuses, blacklisted, reason, group } =
      await client.bonuses.data(message.author.id);

    const word = Functions.declOfNum(bonuses, ["бонус", "бонуса", "бонусов"]);
    const res = [];

    res.push(
      `› **Баланс**: **${bonuses.toLocaleString("be")} ${word}**`,
      `› **Ваша группа**: **${GROUPS[group]}**`,
      `› **Купленные роли**: **${await this.getRoles(client, id)}**`
    );

    if (blacklisted === 1) {
      res.push("");
      res.push("⚠️ | **Вы внесены в чёрный список бонусной системы!**");
      res.push(`**Причина: ${reason}**`);
    }

    const embed = this.embed("DarkPurple", res.join("\n"));
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
