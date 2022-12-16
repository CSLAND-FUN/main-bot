import { Command, CommandCategory } from "@src/classes/Command";
import { Message } from "discord.js";
import DiscordBot from "@src/classes/Discord";

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
