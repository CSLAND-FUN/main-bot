import { Command, CommandCategory } from "@src/classes/Command";
import { bold, Message } from "discord.js";
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
    const _rules = [
      "1) Запрещено обходить блокировку системы любым способом.",
      "2) Запрещена накрутка бонусов путём намеренного АФК в Голосовом Канале с человеком (или людьми).",
      "3) Если выдаётся блокировка, то в большинстве случаев она выдаётся навсегда.",
      "3.1) Также она может привести к очищению статистики пользователя (вплоть до удаления бонусов).",
      "3.2) Если вы желаете оспорить свою блокировку, то обратитесь к Скриптеру, однако мы не даём гарантии, что она будет снята.",
      "4) По условиям Бонусной Системы, вы получаете от 2 до 7 бонусов каждые 5 минут.",
      "4.1) Ни больше, ни меньше вы получить не можете.",
      "4.2) Если в Голосовом Канале меньше двух людей, то счётчик для вас отключается.",
      "5) При подозрении в накрутке владелец Бонусной Системы вправе выдать вам блокировку.",
      "",
      "⚠ | Незнание правил не освобождает от наказания.",
    ];

    const rules = _rules
      .map((rule) => {
        if (rule === "") return "";
        else return bold(rule);
      })
      .join("\n");

    const embed = this.embed("DarkPurple", rules);
    embed.setTitle("Правила Бонусной Системы");

    return message.reply({
      embeds: [embed],
    });
  }
};
