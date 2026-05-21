import chalk from "chalk";
import { basename } from "node:path";
import { fileURLToPath } from "node:url";

const filename = basename(fileURLToPath(import.meta.url));

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

const buildLine = (request_id, message) => {
  const safeRequestId = normalizeRequestId(request_id);
  const safeMessage = normalizeMessage(message);
  return `[${safeRequestId}] ${safeMessage}`;
};

const write = (style) => (request_id = "system", message = "", target = "") => {
  const coloredLine = style(buildLine(request_id, message));

  if (hasTarget(target)) {
    console.log(coloredLine, target);
    return;
  }

  console.log(coloredLine);
};

const writeStatus = (isBold = false) => (request_id = "system", message = "", target = "") => {
  const isTrue = Boolean(target);
  const style = isTrue
    ? (isBold ? chalk.bold.green : chalk.green)
    : (isBold ? chalk.bold.red : chalk.red);
  const coloredLine = style(buildLine(request_id, message));

  if (hasTarget(target)) {
    console.log(coloredLine, target);
    return;
  }

  console.log(coloredLine);
};

const getTerminalWidth = () => {
  if (typeof process.stdout.columns === "number" && process.stdout.columns > 0) {
    return process.stdout.columns;
  }

  return 120;
};

const writeBreak = (style) => (char = "-") => {
  const width = getTerminalWidth();
  const marker = String(char || "-").charAt(0);
  console.log(style(marker.repeat(width)));
};

// cyan
export const  info = write(chalk.cyan);
export const announce = write(chalk.bold.cyan);
export const lineCyan = writeBreak(chalk.cyan);

// magenta
export const results = write(chalk.magenta);
export const debug = write(chalk.bold.magenta);
export const lineMagenta = writeBreak(chalk.magenta);

// red
export const error = write(chalk.red);
export const failure = write(chalk.bold.red);
export const lineRed = writeBreak(chalk.red);

// green
export const step = write(chalk.green);
export const complete = write(chalk.bold.green);
export const lineGreen = writeBreak(chalk.green);

// yellow
export const warning = write(chalk.yellow);
export const advise = write(chalk.bold.yellow);
export const lineYellow = writeBreak(chalk.yellow);

// blue
export const message = write(chalk.blue);
export const note = write(chalk.bold.blue);
export const lineBlue = writeBreak(chalk.blue);

// white
export const title = write(chalk.white);
export const text = write(chalk.bold.white);
export const lineWhite = writeBreak(chalk.white);

// status operated (green when truthy, red when falsy)
export const status = writeStatus(false);
export const statusBold = writeStatus(true);


