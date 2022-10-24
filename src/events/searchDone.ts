import DiscordBot from "@src/classes/Discord";
import { Event } from "@src/classes/Event";
import { Message } from "discord.js";

export = class SearchDoneEvent extends Event<false, true> {
  constructor() {
    super("searchDone", "player");
  }

  async run(client: DiscordBot, message: Message) {
    return;
  }
};
