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
