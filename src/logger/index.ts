enum Level {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR"
}

class Logger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static debug(...messages: any[]): void {
    if (process.env.NODE_ENV === "development") {
      Logger.logEvent(Level.DEBUG, ...messages);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static info(...messages: any[]): void {
    Logger.logEvent(Level.INFO, ...messages);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static warn(...messages: any[]): void {
    Logger.logEvent(Level.WARN, ...messages);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static error(...messages: any[]): void {
    Logger.logEvent(Level.ERROR, ...messages);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static logEvent(level: Level, ...logs: any[]): void {
    // const now = new Date();
    // console.info(`${level}: `, ...logs);
    console.info(...logs);
  }
}

export default Logger;
