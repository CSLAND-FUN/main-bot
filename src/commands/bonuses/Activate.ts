import { Command, CommandCategory } from "@src/classes/Command";
import { bold, Message, time } from "discord.js";
import DiscordBot from "@src/classes/Discord";

export = class ActivateCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.BONUSES,
      name: "activate",

      description: "Позволяет активировать промокод на бонусы.",
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const blacklisted = await client.bonuses.isBlacklisted(message);
    if (blacklisted === true) {
      const embed = this.embed(
        "Red",
        bold("Вы находитесь в чёрном списке!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const code = args[0];
    if (!code) {
      const embed = this.embed(
        "Red",
        bold(`Напишите код для использования!`),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const result = await client.bonuses.activatePromocode(
      message.author.id,
      code
    );

    if (result.status !== true) {
      const embed = this.embed("Red", bold(result.message), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    const embed = this.embed("DarkPurple", bold(result.message), "✅");
    return message.reply({
      embeds: [embed],
    });
  }
};
