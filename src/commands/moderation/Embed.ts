import { Command, CommandCategory } from "@src/classes/Command";
import { Message } from "discord.js";
import DiscordBot from "@src/classes/Discord";

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
    const embed = this.embed("Random", args.join(" "));

    return message.channel.send({
      embeds: [embed],
    });
  }
};
