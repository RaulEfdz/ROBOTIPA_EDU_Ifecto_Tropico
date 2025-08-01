export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

interface LogContext {
  userId?: string;
  route?: string;
  params?: Record<string, any>;
  body?: Record<string, any>;
  stack?: string;
  [key: string]: any; // Allow any additional context
}

export function log(level: LogLevel, message: string, context?: LogContext) {
  const isDebugMode = process.env.NEXT_PUBLIC_DEBUG_MODE === "true";

  if (!isDebugMode && level === LogLevel.DEBUG) {
    return; // Do not log debug messages in non-debug mode
  }

  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...context,
  };

  switch (level) {
    case LogLevel.INFO:
      console.info(JSON.stringify(logEntry));
      break;
    case LogLevel.WARN:
      console.warn(JSON.stringify(logEntry));
      break;
    case LogLevel.ERROR:
      console.error(JSON.stringify(logEntry));
      break;
    case LogLevel.DEBUG:
      console.debug(JSON.stringify(logEntry));
      break;
    default:
      console.log(JSON.stringify(logEntry));
  }
}

// Deprecated functions, kept for compatibility but should be replaced
export function printInitDebug(pageName: string) {
  log(LogLevel.DEBUG, "Application initialized", { pageName });
}

export function printDebug(pageName: string) {
  log(LogLevel.DEBUG, "Debug message", { pageName });
}
