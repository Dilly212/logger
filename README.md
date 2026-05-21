# logger

Lightweight ESM logger with color-coded terminal output powered by `chalk`.

## Contents

- 16 message log functions (normal + bold across 7 color groups, plus status normal/bold)
- 7 color separator line functions (`lineCyan`, `lineMagenta`, etc.)
- Unified input normalization for `request_id`, `message`, and `target`
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
	lineRed,
	lineGreen,
} from "logger";

announce("req-123", "starting task", { task: "sync" });
info(false, "using default request id");
status("req-123", "db connected", true);
statusBold("req-123", "db disconnected", false);
lineGreen("=");
error("req-123", "something failed", { retry: true });
lineRed("!");
```

## Exported API

All exports are available from `src/index.js`.

### Message functions

Each message function has this signature:

```js
fn(request_id = "system", message = "", target = "")
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

### Line break functions

Use these to print a long colored separator across terminal width:

- `lineCyan`
- `lineMagenta`
- `lineRed`
- `lineGreen`
- `lineYellow`
- `lineBlue`
- `lineWhite`

Signature:

```js
lineFn(char = "-")
```

Notes:

- Uses terminal width from `process.stdout.columns`.
- Falls back to width `120` if terminal width is unavailable.
- If `char` has more than one character, only the first character is used.

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