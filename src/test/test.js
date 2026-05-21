import * as logger from "../index.js";

// cyan
logger.info("example", "info message", true);
logger.announce("example", "announce message", { module: "examples" });
logger.lineCyan();

// magenta
logger.results("example", "results message", ["one", "two"]);
logger.debug("example", "debug message", 42);
logger.lineMagenta("=");

// red
logger.error("example", "error message", { code: 500 });
logger.failure("example", "failure message", false);
logger.lineRed("!");

// green
logger.step("example", "step message", "target");
logger.complete("example", "complete message", 1);
logger.lineGreen("+");

// yellow
logger.warning("example", "warning message", { retry: true });
logger.advise("example", "advise message", ["a", "b"]);
logger.lineYellow("~");

// blue
logger.message("example", "message text", { nested: { ok: true } });
logger.note("example", "note text", 0);
logger.lineBlue(".");

// white
logger.title("example", "title text", "readme");
logger.text("example", "text message", "done");
logger.lineWhite("_");

// fallback checks
logger.announce(false, "request id fallback");
logger.info("id", "", "message fallback");

// status operated checks
logger.status("example", "status true should be green", true);
logger.status("example", "status false should be red", false);
logger.statusBold("example", "status bold true should be green", 1);
logger.statusBold("example", "status bold false should be red", 0);
logger.statusLine("-", true);
logger.statusLine("=", false, { bold: true });

// table wrappers
logger.table("example", "table output", [
	{ id: 1, state: "ok" },
	{ id: 2, state: "warn" },
], { timestamp: true });
logger.tableBold("example", "table bold output", {
	service: "logger",
	healthy: true,
});

// json safe stringify + timestamp option
const circular = { id: 1, label: "circular" };
circular.self = circular;
logger.json("example", "json output", circular, { timestamp: true, space: 2 });

// time wrappers
logger.time("example", "timed operation", "start", { label: "example-timer", timestamp: true });
for (let i = 0; i < 100000; i += 1) {
	Math.sqrt(i);
}
logger.timeEnd("example", "timed operation", "end", { label: "example-timer", timestamp: true });

// level filter by DEBUG
const previousDebugLevel = process.env.DEBUG;
process.env.DEBUG = "warn";
logger.debug("example", "this debug log should be suppressed");
logger.warning("example", "this warning log should be visible");
process.env.DEBUG = previousDebugLevel;
