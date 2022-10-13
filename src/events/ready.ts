import DiscordBot from "@src/classes/Discord";
import { Event } from "@src/classes/Event";

export = class ReadyEvent extends Event {
  constructor() {
    super("ready");
  }

  run(client: DiscordBot) {
    console.log(`${client.user.tag} is started!`);
  }
};
