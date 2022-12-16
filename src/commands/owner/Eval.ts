import { Command, CommandCategory } from "@src/classes/Command";
import { bold, codeBlock, Message } from "discord.js";
import { inspect } from "util";
import DiscordBot from "@src/classes/Discord";

export = class EvalCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.OWNER,
      name: "eval",

      description: "Выполняет указанный код.",
      ownerOnly: true,
    });
  }

  async run(client: DiscordBot, message: Message, args: string[]) {
    const code = args.join(" ");

    if (!code) {
      const embed = this.embed(
        "Red",
        bold("Напишите код для выполнения!"),
        "❌"
      );

      return message.reply({
        embeds: [embed],
      });
    }

    var evaled = await eval(code);
    if (typeof evaled === "object") evaled = inspect(evaled, { depth: 0 });

    const embed = this.embed("DarkPurple", codeBlock("ts", evaled));
    return message.reply({
      embeds: [embed],
    });
  }
};
