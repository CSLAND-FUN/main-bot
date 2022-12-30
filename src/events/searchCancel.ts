import { Message } from "discord.js";
import { Event } from "@src/classes/Event";
import DiscordBot from "@src/classes/Discord";

export = class SearchCancelEvent extends Event<false, true> {
  constructor() {
    super("searchCancel", "player");
  }

  async run(client: DiscordBot, message: Message) {
    return;
  }
};
