import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import { Message } from "discord.js";

export = class EmbedCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.MODERATION,
      name: "embed",

      description: "Создаёт сообщение в Embed стиле.",
      permissions: ["ManageGuild"],
    });
  }

  run(client: DiscordBot, message: Message, args: string[]) {
    const embed = this.embed(client, message, "Random", "bot", args.join(" "));
    return message.channel.send({
      embeds: [embed],
    });
  }
};
