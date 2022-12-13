console.clear();

import Logger from "./classes/Logger";
import dotenv from "dotenv";

const flags = process.argv;
if (flags.includes("--dev-mode")) {
  dotenv.config({
    path: "../configs/.env.development",
  });

  Logger.debug("Starting in Development Mode\n", "Starter");
} else if (flags.includes("--production")) {
  dotenv.config({
    path: "../configs/.env.production",
  });

  Logger.debug("Starting in Production Mode\n", "Starter");
}

import "./index";
