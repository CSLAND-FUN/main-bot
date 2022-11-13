import DiscordBot from "@src/classes/Discord";
import { Event } from "@src/classes/Event";
import { Message } from "discord.js";

export = class SearchInvalidAnswerEvent extends Event<false, true> {
  constructor() {
    super("searchInvalidAnswer", "player");
  }

  async run(client: DiscordBot, message: Message) {
    return;
  }
};
