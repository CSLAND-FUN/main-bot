import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import { Message } from "discord.js";

export = class TopCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.BONUSES,
      name: "top",

      aliases: ["leaders"],
      description: "Выводит топ пользователей по бонусам.",
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const top = await client.bonuses.top(message);
    const embed = this.embed("DarkPurple", top);
    embed.setTitle("Текущий Топ-50 (по бонусам)");

    return message.reply({
      embeds: [embed],
    });
  }
};
