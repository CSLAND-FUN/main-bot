import EventEmitter from "node:events";
import Discord from "./Discord";
import Logger from "./Logger";

import Glob from "glob";
import util from "util";
import path from "path";

import type { Command } from "./Command";
import type { Event } from "./Event";

export = class Handler {
  public client: Discord;

  constructor(client: Discord) {
    this.client = client;
  }

  async loadAll() {
    const glob = util.promisify(Glob);

    const [commandsDir, eventsDir] = [
      "./commands/**/*{.ts,.js}",
      "./events/**/*{.ts,.js}",
    ];

    const events = await glob(eventsDir);
    const commands = await glob(commandsDir);

    for (const eventPath of events) {
      const eventFile = await (
        await import(path.resolve(process.cwd(), eventPath))
      ).default;
      const event = new eventFile() as Event;

      this.client.events.set(event.name, event);

      if (typeof event.emitter !== "undefined") {
        (this.client[event.emitter] as EventEmitter).on(
          event.name,
          (...params) => {
            event.run(this.client, ...params);
          }
        );
      } else {
        this.client.on(event.name, (...params) => {
          event.run(this.client, ...params);
        });
      }

      Logger.debug(`Loaded "${event.name}" Event!`, "Handler");
    }

    console.log("\n");

    for (const commandPath of commands) {
      const commandFile = await (
        await import(path.resolve(process.cwd(), commandPath))
      ).default;
      const command = new commandFile() as Command;

      if (command.data.aliases) {
        for (const alias of command.data.aliases) {
          this.client.aliases.set(alias, command.data.name);
        }
      }

      this.client.commands.set(command.data.name, command);
      Logger.debug(`Loaded "${command.data.name}" Command!`, "Handler");
    }

    console.log("\n");
  }
};
