import { bold, Message, TextChannel } from "discord.js";
import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";

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
    if (
      !amount ||
      !Number(amount) ||
      (amount as any as number) > 100 ||
      (amount as any as number) < 1
    ) {
      const embed = this.embed(
        "Red",
        bold("Укажите количество сообщений (число до 100)!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    await (message.channel as TextChannel).bulkDelete(
      amount as any as number,
      true
    );

    const embed = this.embed("DarkPurple", bold("Чат был очищен!"), "❌");
    const msg = await message.reply({
      embeds: [embed],
    });

    setTimeout(async () => {
      await msg.delete();
    }, 2000);
  }
};
