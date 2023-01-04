import { Event } from "@src/classes/Event";
import ServerStatus from "@src/messages/serverStatus";
import DiscordBot from "@src/classes/Discord";
import Logger from "@src/classes/Logger";

export = class ReadyEvent extends Event {
  constructor() {
    super("ready");
  }

  async run(client: DiscordBot) {
    // prettier-ignore
    Logger.debug(`Disabling Bonus Counter for Active Users due to restart!`,"Bonuses");
    await client.bonuses.checker();

    Logger.log(`${client.user.tag} is started!`);
    await ServerStatus(client);
  }
};
