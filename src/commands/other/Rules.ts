import { Command, CommandCategory } from "@src/classes/Command";
import { APIEmbedField, bold, Message, time } from "discord.js";
import DiscordBot from "@src/classes/Discord";

export = class RulesCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.OTHER,
      name: "rules",

      description: "Выводит правила Бонусной Системы.",
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const StandardField: APIEmbedField = {
      name: "1. Стандартные правила",
      value: [
        "1.1. Запрещён обход блокировки системы бонусов любым возможным способом.",
        "1.2. Запрещена накрутка бонусов путём намеренного AFK в Голосовом Канале с человеком/людьми.",
        "1.3. Если выдаётся блокировка системы, то в большинстве случаев она выдаётся навсегда.",
        "1.3.1. Блокировка системы может привести к полному сбросу вашей статистики (включая бонусы).",
        "1.3.2. Блокировку системы можно оспорить путём рассуждения со Скриптером, однако гарантии мы не даём.",
      ]
        .map((str) => (str !== "" ? bold(str) : ""))
        .join("\n"),
    };

    const BonusesField: APIEmbedField = {
      name: "2. Бонусы",
      value: [
        "2.1. По условиям бонусной системы вы получаете от 2 до 7 бонусов каждые 5 минут, проведённые в Голосовом Канале.",
        "2.1.1. Ни больше, ни меньше бонусов вы получить не можете.",
        "2.1.2. Если же в Голосовом Канале становится меньше двух людей, счётчик бонусов отключается.",
        "2.2. При подозрении в накрутке бонусов владелец Бонусной Системы вправе выдать вам блокировку __без предупреждения__.",
      ]
        .map((str) => (str !== "" ? bold(str) : ""))
        .join("\n"),
    };

    const PromocodesField: APIEmbedField = {
      name: "3. Промокоды",
      value: [
        "3.1. Промокоды — коды за активацию которых, через команду `!activate`, вы получите бонусы на свой счёт.",
        "3.2. Промокоды одноразовые, то есть ВЫ можете активировать их только один раз.",
        "3.3. Промокоды не создаются автоматически, они создаются по желанию владельца системы.",
        "3.4. Так же вы не можете самостоятельно узнать какие промокоды сейчас активны и доступны, их вы узнаёте также от владельца системы.",
      ]
        .map((str) => (str !== "" ? bold(str) : ""))
        .join("\n"),
    };

    const date = new Date(1673083005634).toLocaleString("ru", {
      timeZone: "Europe/Moscow",
    });

    const last_change = `Последнее изменение: ${date}`;
    const embed = this.embed("DarkPurple", bold(last_change));
    embed.setTitle("Положение Бонусной Системы");
    embed.addFields(StandardField, BonusesField, PromocodesField);
    embed.setFooter({
      text: "Незнание правил не освобождает от ответственности!",
    });

    return message.reply({
      embeds: [embed],
    });
  }
};
