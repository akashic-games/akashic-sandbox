export interface LogData {
	level: "debug" | "info" | "warn" | "error";
	message: string;
	cause?: any;
}

export function consoleLogger(logData: LogData) {
	const levelTable = ["debug", "info", "warn", "error"];
	const logLevel = levelTable.indexOf("debug");
	const table = {
		"debug": console.log.bind(console),
		"info": console.info.bind(console),
		"warn": console.warn.bind(console),
		"error": console.error.bind(console)
	};
	const func = table[logData.level];
	if (!func || levelTable.indexOf(logData.level) < logLevel)
		return;
	func(`[${logData.level}]\t${logData.message}`);
	if (logData.cause)
		func(logData.cause);
}
