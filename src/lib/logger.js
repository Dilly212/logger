import chalk from "chalk";
import { basename } from "node:path";
import { fileURLToPath } from "node:url";

const filename = basename(fileURLToPath(import.meta.url));
const LOG_LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 99,
};

const DEFAULT_LEVEL = "debug";

const normalizeOptions = (options = {}) => {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    return {};
  }

  return options;
};

const getMinLevelFromEnv = () => {
  const raw = String(process.env.DEBUG || "").trim().toLowerCase();

  if (!raw) {
    return DEFAULT_LEVEL;
  }

  if (raw === "1" || raw === "true" || raw === "on") {
    return "debug";
  }

  if (raw === "0" || raw === "false" || raw === "off") {
    return "silent";
  }

  if (raw in LOG_LEVELS) {
    return raw;
  }

  return DEFAULT_LEVEL;
};

const shouldLog = (level = "info") => {
  const currentLevel = LOG_LEVELS[level] ?? LOG_LEVELS.info;
  const minLevelName = getMinLevelFromEnv();
  const minLevel = LOG_LEVELS[minLevelName] ?? LOG_LEVELS.debug;
  return currentLevel >= minLevel;
};

const normalizeRequestId = (request_id) => {
  if (request_id === false || request_id === undefined || request_id === null || request_id === "") {
    return "system";
  }

  return String(request_id);
};

const normalizeMessage = (message) => {
  if (!message) {
    return `message not available - ${filename}`;
  }

  return String(message);
};

const hasTarget = (target) => {
  return target !== undefined && target !== null && target !== "";
};

const buildLine = (request_id, message, options = {}) => {
  const safeOptions = normalizeOptions(options);
  const safeRequestId = normalizeRequestId(request_id);
  const safeMessage = normalizeMessage(message);
  const timestamp = safeOptions.timestamp ? `[${new Date().toISOString()}] ` : "";
  return `${timestamp}[${safeRequestId}] ${safeMessage}`;
};

const emitLine = (style, level, request_id, message, target = "", options = {}) => {
  if (!shouldLog(level)) {
    return;
  }

  const coloredLine = style(buildLine(request_id, message, options));

  if (hasTarget(target)) {
    console.log(coloredLine, target);
    return;
  }

  console.log(coloredLine);
};

const write = (style, level = "info") => (request_id = "system", message = "", target = "", options = {}) => {
  emitLine(style, level, request_id, message, target, options);
};

const writeStatus = (isBold = false, level = "info") => (request_id = "system", message = "", target = "", options = {}) => {
  const isTrue = Boolean(target);
  const style = isTrue
    ? (isBold ? chalk.bold.green : chalk.green)
    : (isBold ? chalk.bold.red : chalk.red);

  emitLine(style, level, request_id, message, target, options);
};

const getTerminalWidth = () => {
  if (typeof process.stdout.columns === "number" && process.stdout.columns > 0) {
    return process.stdout.columns;
  }

  return 120;
};

const writeBreak = (style, level = "info") => (char = "-") => {
  if (!shouldLog(level)) {
    return;
  }

  const width = getTerminalWidth();
  const marker = String(char || "-").charAt(0);
  console.log(style(marker.repeat(width)));
};

const writeStatusLine = (char = "-", target = false, options = {}) => {
  const safeOptions = normalizeOptions(options);
  const style = Boolean(target)
    ? (safeOptions.bold ? chalk.bold.green : chalk.green)
    : (safeOptions.bold ? chalk.bold.red : chalk.red);

  writeBreak(style, "info")(char);
};

const safeStringify = (value, space = 2) => {
  const seen = new WeakSet();

  try {
    return JSON.stringify(value, (key, currentValue) => {
      if (typeof currentValue === "bigint") {
        return `${currentValue}n`;
      }

      if (currentValue && typeof currentValue === "object") {
        if (seen.has(currentValue)) {
          return "[Circular]";
        }

        seen.add(currentValue);
      }

      return currentValue;
    }, space);
  } catch {
    return "[Unserializable value]";
  }
};

const buildTimerLabel = (request_id = "system", message = "", options = {}) => {
  const safeOptions = normalizeOptions(options);

  if (safeOptions.label) {
    return String(safeOptions.label);
  }

  return `${normalizeRequestId(request_id)}:${normalizeMessage(message)}`;
};

const writeTable = (isBold = false, level = "info") => (request_id = "system", message = "", target = [], options = {}) => {
  if (!shouldLog(level)) {
    return;
  }

  const style = isBold ? chalk.bold.cyan : chalk.cyan;
  emitLine(style, level, request_id, message, "", options);

  const data = hasTarget(target) ? target : [];
  console.table(data);
};

export const json = (request_id = "system", message = "", target = "", options = {}) => {
  const safeOptions = normalizeOptions(options);

  if (!shouldLog("debug")) {
    return;
  }

  emitLine(chalk.white, "debug", request_id, message, "", safeOptions);
  const value = hasTarget(target) ? target : message;
  const space = Number.isInteger(safeOptions.space) ? safeOptions.space : 2;
  console.log(safeStringify(value, space));
};

export const time = (request_id = "system", message = "", target = "", options = {}) => {
  const safeOptions = normalizeOptions(options);

  if (!shouldLog("debug")) {
    return;
  }

  const label = buildTimerLabel(request_id, message, safeOptions);
  emitLine(chalk.magenta, "debug", request_id, `${normalizeMessage(message)} (timer start: ${label})`, target, safeOptions);
  console.time(label);
};

export const timeEnd = (request_id = "system", message = "", target = "", options = {}) => {
  const safeOptions = normalizeOptions(options);

  if (!shouldLog("debug")) {
    return;
  }

  const label = buildTimerLabel(request_id, message, safeOptions);
  emitLine(chalk.bold.magenta, "debug", request_id, `${normalizeMessage(message)} (timer end: ${label})`, target, safeOptions);
  console.timeEnd(label);
};

// cyan
export const info = write(chalk.cyan, "info");
export const announce = write(chalk.bold.cyan, "info");
export const lineCyan = writeBreak(chalk.cyan, "info");

// magenta
export const results = write(chalk.magenta, "info");
export const debug = write(chalk.bold.magenta, "debug");
export const lineMagenta = writeBreak(chalk.magenta, "debug");

// red
export const error = write(chalk.red, "error");
export const failure = write(chalk.bold.red, "error");
export const lineRed = writeBreak(chalk.red, "error");

// green
export const step = write(chalk.green, "info");
export const complete = write(chalk.bold.green, "info");
export const lineGreen = writeBreak(chalk.green, "info");

// yellow
export const warning = write(chalk.yellow, "warn");
export const advise = write(chalk.bold.yellow, "warn");
export const lineYellow = writeBreak(chalk.yellow, "warn");

// blue
export const message = write(chalk.blue, "info");
export const note = write(chalk.bold.blue, "debug");
export const lineBlue = writeBreak(chalk.blue, "info");

// white
export const title = write(chalk.white, "info");
export const text = write(chalk.bold.white, "info");
export const lineWhite = writeBreak(chalk.white, "info");

// status operated (green when truthy, red when falsy)
export const status = writeStatus(false, "info");
export const statusBold = writeStatus(true, "info");
export const statusLine = writeStatusLine;

// table wrappers with colored headers
export const table = writeTable(false, "info");
export const tableBold = writeTable(true, "info");


