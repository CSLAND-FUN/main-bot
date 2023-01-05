import { bold, Message, TextChannel } from "discord.js";
import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import Functions from "@src/classes/Functions";

export = class ClearCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.MODERATION,
      name: "clear",

      description: "Очищает сообщения в канале.",
      permissions: ["ManageMessages"],
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const amount = args[0];
    if (!amount) {
      const embed = this.embed(
        "Red",
        bold("Укажите количество сообщений (число до 100)!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    const checker = Functions.checkNumber(Number(amount), true);
    if (typeof checker !== "number") {
      const embed = this.embed("Red", bold(checker), "❌");
      return message.reply({
        embeds: [embed],
      });
    } else if (checker > 100) {
      const embed = this.embed("Red", bold("Укажите число до 100!"), "❌");
      return message.reply({
        embeds: [embed],
      });
    }

    await (message.channel as TextChannel).bulkDelete(checker, true);

    const embed = this.embed("DarkPurple", bold("Чат был очищен!"), "❌");
    const msg = await message.reply({
      embeds: [embed],
    });

    setTimeout(async () => {
      await msg.delete();
    }, 2000);
  }
};
