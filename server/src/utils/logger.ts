type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

function timestamp(): string {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, message: string): string {
  return `[${timestamp()}] [${level}] ${message}`;
}

export const logger = {
  info(message: string, ...args: unknown[]): void {
    console.log(formatMessage("INFO", message), ...args);
  },

  warn(message: string, ...args: unknown[]): void {
    console.warn(formatMessage("WARN", message), ...args);
  },

  error(message: string, ...args: unknown[]): void {
    console.error(formatMessage("ERROR", message), ...args);
  },

  debug(message: string, ...args: unknown[]): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(formatMessage("DEBUG", message), ...args);
    }
  },
};
