import { Command, CommandCategory } from "@src/classes/Command";
import DiscordBot from "@src/classes/Discord";
import { Message } from "discord.js";

export = class MSGCommand extends Command {
  constructor() {
    super({
      category: CommandCategory.MODERATION,
      name: "msg",

      description: "Создаёт сообщение в канал.",
      permissions: ["ManageGuild"],
    });
  }

  run(client: DiscordBot, message: Message, args: string[]) {
    return message.channel.send(args.join(" "));
  }
};
