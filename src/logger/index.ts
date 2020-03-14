enum Level {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR"
}

class Logger {
  static debug(...messages: any[]): void {
    if (process.env.NODE_ENV === "development") {
      Logger.logEvent(Level.DEBUG, ...messages);
    }
  }

  static info(...messages: any[]): void {
    Logger.logEvent(Level.INFO, ...messages);
  }

  static warn(...messages: any[]): void {
    Logger.logEvent(Level.WARN, ...messages);
  }

  static error(...messages: any[]): void {
    Logger.logEvent(Level.ERROR, ...messages);
  }

  private static logEvent(level: Level, ...logs: any[]) {
    // const now = new Date();
    // console.info(`${level}: `, ...logs);
    console.info(...logs);
  }
}

export default Logger;
