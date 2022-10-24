import DiscordBot from "@src/classes/Discord";
import { Event } from "@src/classes/Event";
import { Message } from "discord.js";

export = class SearchNoResultEvent extends Event<false, true> {
  constructor() {
    super("searchNoResult", "player");
  }

  async run(client: DiscordBot, message: Message) {
    return;
  }
};
