import DiscordBot from "@src/classes/Discord";
import { Event } from "@src/classes/Event";
import { Message } from "discord.js";

export = class SearchCancelEvent extends Event<false, true> {
  constructor() {
    super("searchCancel", "player");
  }

  async run(client: DiscordBot, message: Message) {
    return;
  }
};
