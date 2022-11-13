import EventEmitter from "node:events";

import Glob from "glob";
import { promisify } from "util";

import type { Command } from "./Command";
import DiscordBot from "./Discord";
import type { Event } from "./Event";

import path from "path";

export = class Handler {
  public client: DiscordBot;

  constructor(client: DiscordBot) {
    this.client = client;
  }

  async loadAll() {
    const glob = promisify(Glob);

    const [commandsDir, eventsDir] = [
      "./commands/**/*{.ts,.js}",
      "./events/**/*{.ts,.js}",
    ];

    const events = await glob(eventsDir);
    const commands = await glob(commandsDir);

    const envOut = [];
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

      envOut.push(`[Handler] Loaded "${event.name}" Event!`);
    }

    console.log(envOut.join("\n"));
    console.log("\n");

    const cmdOut = [];
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
      cmdOut.push(`[Handler] Loaded "${command.data.name}" Command!`);
    }

    console.log(cmdOut.join("\n"));
    console.log("\n");
  }
};
