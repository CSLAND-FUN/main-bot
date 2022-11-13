import DiscordBot from "@src/classes/Discord";
import { Event } from "@src/classes/Event";
import serverStatus from "@src/messages/serverStatus";

export = class ReadyEvent extends Event {
  constructor() {
    super("ready");
  }

  async run(client: DiscordBot) {
    console.log(`${client.user.tag} is started!`);

    await serverStatus(client);
  }
};
