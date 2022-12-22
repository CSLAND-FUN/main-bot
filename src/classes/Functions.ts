import { EmbedAuthorData, Message } from "discord.js";
import { z } from "zod";

export = {
  declOfNum: (number: number, words: string[]) => {
    return words[
      number % 100 > 4 && number % 100 < 20
        ? 2
        : [2, 0, 1, 1, 1, 2][number % 10 < 5 ? number % 10 : 5]
    ];
  },

  checkNumber: (arg: any, positive = true) => {
    const num_checker = z.number();

    const result = num_checker.safeParse(arg);
    if (result.success !== true) {
      return "Указанный аргумент не является числом!";
    }

    if (positive === true) {
      const result = num_checker.positive().safeParse(arg);
      if (result.success !== true) {
        return "Указанный аргумент не является положительным числом!";
      }
    } else if (positive === false) {
      const result = num_checker.negative().safeParse(arg);
      if (result.success !== true) {
        return "Указанный аргумент не является отрицательным числом!";
      }
    }

    return arg as number;
  },

  getAuthor: (message: Message): EmbedAuthorData => {
    return {
      name: message.author.tag,
      iconURL: message.author.displayAvatarURL({
        forceStatic: true,
        size: 2048,
      }),
    };
  },
};
