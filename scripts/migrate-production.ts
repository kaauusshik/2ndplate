import { realpathSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

import { closeDbExec, withMigrationRuntime } from "@agent-native/core/db";
import { loadEnv } from "@agent-native/core/scripts";
import {
  runAppReleaseMigrations,
  runFrameworkReleaseMigrations,
} from "@agent-native/core/server";

loadEnv();

// Zero-database mode: skipping database migrations completely
console.log("In-memory mode: skipping database migrations.");
process.exit(0);
