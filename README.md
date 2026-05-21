# logger

Lightweight ESM logger with color-coded terminal output powered by `chalk`.

## Contents

- 16 message log functions (normal + bold across 7 color groups, plus status normal/bold)
- 7 color separator line functions (`lineCyan`, `lineMagenta`, etc.)
- Boolean-based `statusLine` separator (green/red)
- `json` logger with circular-safe stringify fallback
- `table` and `tableBold` wrappers with colored headers
- `time` and `timeEnd` timer wrappers
- Unified input normalization for `request_id`, `message`, and `target`
- Per-call `options = {}` support (for example `timestamp` mode)
- Env-based log filtering via `DEBUG=`
- Release-check workflow that runs when package version changes

## Install

```bash
npm install logger
```

For local development in this repo:

```bash
npm install
```

## Usage

```js
import {
	announce,
	info,
	error,
	status,
	statusBold,
	statusLine,
	table,
	tableBold,
	json,
	time,
	timeEnd,
	lineRed,
	lineGreen,
} from "logger";

announce("req-123", "starting task", { task: "sync" });
info(false, "using default request id");
status("req-123", "db connected", true);
statusBold("req-123", "db disconnected", false);
statusLine("-", true);
table("req-123", "users", [{ id: 1, name: "Ada" }], { timestamp: true });
json("req-123", "payload", { ok: true }, { timestamp: true });
time("req-123", "query", "start", { label: "db-query" });
timeEnd("req-123", "query", "end", { label: "db-query" });
lineGreen("=");
error("req-123", "something failed", { retry: true });
lineRed("!");
```

## Exported API

All exports are available from `src/index.js`.

### Message functions

Each message function has this signature:

```js
fn(request_id = "system", message = "", target = "", options = {})
```

| Color | Normal | Bold |
|---|---|---|
| Cyan | `announce` | `info` |
| Magenta | `results` | `debug` |
| Red | `error` | `failure` |
| Green | `step` | `complete` |
| Yellow | `warning` | `advise` |
| Blue | `message` | `note` |
| White | `title` | `text` |
| Status operated | `status` | `statusBold` |

Additional message helpers:

- `json(request_id = "system", message = "", target = "", options = {})`
- `table(request_id = "system", message = "", target = [], options = {})`
- `tableBold(request_id = "system", message = "", target = [], options = {})`
- `time(request_id = "system", message = "", target = "", options = {})`
- `timeEnd(request_id = "system", message = "", target = "", options = {})`

### Line break functions

Use these to print a long colored separator across terminal width:

- `lineCyan`
- `lineMagenta`
- `lineRed`
- `lineGreen`
- `lineYellow`
- `lineBlue`
- `lineWhite`
- `statusLine(char = "-", target = false, options = {})`

Signature:

```js
lineFn(char = "-")
```

Notes:

- Uses terminal width from `process.stdout.columns`.
- Falls back to width `120` if terminal width is unavailable.
- If `char` has more than one character, only the first character is used.
- `statusLine` prints green when `target` is truthy, red when `target` is falsy.
- `statusLine` supports `options.bold`.

## Options

Most log functions accept a final `options = {}` argument.

Supported options:

- `timestamp: true` adds an ISO timestamp prefix.
- `label: "timer-name"` sets the timer label for `time` and `timeEnd`.
- `space: 2` controls pretty-print indentation for `json`.
- `bold: true` is used by `statusLine`.

Example:

```js
status("req-123", "health", true, { timestamp: true });
json("req-123", "payload", data, { timestamp: true, space: 2 });
time("req-123", "build", "start", { label: "build-step", timestamp: true });
timeEnd("req-123", "build", "end", { label: "build-step", timestamp: true });
```

## Log Level Filtering

Set `DEBUG` to control minimum log level globally:

- `DEBUG=debug` shows everything (default)
- `DEBUG=info` hides debug-level logs
- `DEBUG=warn` shows only warnings and errors
- `DEBUG=error` shows only errors
- `DEBUG=silent` (or `DEBUG=false` / `DEBUG=0`) disables logger output

PowerShell examples:

```powershell
$env:DEBUG = "warn"
npm test
```

```powershell
$env:DEBUG = "debug"
npm test
```

## Input behavior reference

| Input | Value(s) | Behavior | Example output |
|---|---|---|---|
| `request_id` | `false`, `undefined`, `null`, `""` | Falls back to `system` | `[system] ...` |
| `request_id` | any other value (`"req-1"`, `42`, `true`) | Coerced with `String(value)` | `[42] ...` |
| `message` | any falsy value (`""`, `0`, `false`, `null`, `undefined`) | Replaced with `message not available - logger.js` | `[id] message not available - logger.js` |
| `message` | any truthy value | Coerced with `String(value)` | `[id] hello` |
| `target` | `undefined`, `null`, `""` | Omitted from output | `[id] hello` |
| `target` | any other value (`0`, `false`, array, object, string, number) | Printed as second `console.log` argument | `[id] hello { x: 1 }` |

Coloring behavior:

- Color is applied only to `[request_id] message`.
- `target` is intentionally uncolored.
- `status` and `statusBold` choose green when `target` is truthy, red when `target` is falsy.

## Dev scripts

- `npm test`: runs `src/test/test.js` to exercise all exports and fallback behavior.

## Release checks

This repo includes `.github/workflows/release-check.yml`.

On pushes to `main`/`master`, it:

1. Detects whether `package.json` version changed.
2. If changed, runs release readiness checks:
	 - `npm ci`
	 - `npm test`
	 - `npm run --if-present examples`
	 - `npm pack --dry-run`

You can also run it manually via `workflow_dispatch`.

## License

MIT