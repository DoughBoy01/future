/**
 * Production-safe logger utility
 *
 * In development: All logs are output to console
 * In production: Only errors are logged, debug/info/warn are suppressed
 *
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.debug('User data:', userData);
 *   logger.info('Action completed');
 *   logger.warn('Deprecation warning');
 *   logger.error('Failed to load', error);
 */

const isDevelopment = import.meta.env.DEV;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  context?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private context: string | undefined;

  constructor(context?: string) {
    this.context = context;
  }

  /**
   * Debug-level logging (development only)
   * Use for detailed debugging information
   */
  debug(message: string, ...args: any[]): void {
    if (!isDevelopment) return;
    this.log('debug', message, ...args);
  }

  /**
   * Info-level logging (development only)
   * Use for general informational messages
   */
  info(message: string, ...args: any[]): void {
    if (!isDevelopment) return;
    this.log('info', message, ...args);
  }

  /**
   * Warning-level logging (development only)
   * Use for warning messages that don't prevent operation
   */
  warn(message: string, ...args: any[]): void {
    if (!isDevelopment) return;
    this.log('warn', message, ...args);
  }

  /**
   * Error-level logging (always logged)
   * Use for errors and exceptions
   * In production, consider sending to error tracking service
   */
  error(message: string, error?: Error | unknown, ...args: any[]): void {
    this.log('error', message, error, ...args);

    // TODO: In production, send to error tracking service (Sentry, etc.)
    // if (!isDevelopment && error) {
    //   Sentry.captureException(error, { extra: { message, ...args } });
    // }
  }

  /**
   * Group related logs together (development only)
   */
  group(label: string, collapsed: boolean = false): void {
    if (!isDevelopment) return;

    if (collapsed) {
      console.groupCollapsed(this.formatMessage(label));
    } else {
      console.group(this.formatMessage(label));
    }
  }

  /**
   * End a log group
   */
  groupEnd(): void {
    if (!isDevelopment) return;
    console.groupEnd();
  }

  /**
   * Time a block of code (development only)
   */
  time(label: string): void {
    if (!isDevelopment) return;
    console.time(this.formatMessage(label));
  }

  /**
   * End timing a block of code
   */
  timeEnd(label: string): void {
    if (!isDevelopment) return;
    console.timeEnd(this.formatMessage(label));
  }

  /**
   * Create a child logger with a specific context
   */
  child(context: string): Logger {
    const childContext = this.context ? `${this.context}:${context}` : context;
    return new Logger(childContext);
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    const formattedMessage = this.formatMessage(message);
    const consoleMethod = console[level] || console.log;

    if (args.length > 0) {
      consoleMethod(formattedMessage, ...args);
    } else {
      consoleMethod(formattedMessage);
    }
  }

  private formatMessage(message: string): string {
    if (this.context) {
      return `[${this.context}] ${message}`;
    }
    return message;
  }
}

// Export default logger instance
export const logger = new Logger();

// Export factory for creating contextual loggers
export const createLogger = (context: string): Logger => {
  return new Logger(context);
};

// Convenience exports for specific contexts
export const authLogger = new Logger('Auth');
export const apiLogger = new Logger('API');
export const dbLogger = new Logger('Database');
export const routerLogger = new Logger('Router');
