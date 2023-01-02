import { execSync } from "child_process";
import Logger from "../src/classes/Logger";

//? Removing Old Build
// prettier-ignore
Logger.log(
  [
    "Starting Build Script...", 
    "Removing old build...\n"
  ].join("\n"),
  "Build"
);

execSync('"powershell.exe" rm -r build');

//? Compiling source code
Logger.log('Done. Running "tsc"...\n', "Build");
execSync("tsc -p tsconfig.json");

//? Using prettier
Logger.log(
  [
    "Build process is finished!",
    "Making build look prettier",
    'Running "prettier"...\n',
  ].join("\n"),
  "Build"
);
execSync("prettier --write build");

//? Profit
Logger.log(
  "The job is done, complilation process is successfully ended!",
  "Build"
);
