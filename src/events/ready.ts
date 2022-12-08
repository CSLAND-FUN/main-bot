import { Event } from "@src/classes/Event";

import DiscordBot from "@src/classes/Discord";
import Logger from "@src/classes/Logger";

import serverStatus from "@src/messages/serverStatus";

export = class ReadyEvent extends Event {
  constructor() {
    super("ready");
  }

  async run(client: DiscordBot) {
    Logger.log(`${client.user.tag} is started!`);

    await serverStatus(client);
  }
};
