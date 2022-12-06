import picocolors from "picocolors";

export = {
  log: (message: string, tag = "Discord") => {
    const colored = picocolors.cyan(tag);
    console.log(`[${colored}] ${message}`);
  },

  error: (message: string, tag = "Discord") => {
    const colored = picocolors.red(tag);
    console.log(`[${colored}] ${message}`);
  },

  warn: (message: string, tag = "Discord") => {
    const colored = picocolors.yellow(tag);
    console.log(`[${colored}] ${message}`);
  },

  debug: (message: string, tag = "Discord") => {
    const colored = picocolors.green(tag);
    console.log(`[${colored}] ${message}`);
  },
};
