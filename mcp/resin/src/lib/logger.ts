/**
 * Structured Logger for Cloudflare Workers
 *
 * Provides structured JSON logging that works with:
 * - wrangler tail (local debugging)
 * - Workers Logpush (production logging)
 * - Third-party log aggregators
 *
 * Usage:
 *   const logger = createLogger({ requestId: "abc123" });
 *   logger.info("Request received", { endpoint: "/health" });
 *   logger.error("Database error", { error: err });
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  requestId?: string;
  userId?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  data?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
}

export interface Logger {
  debug(message: string, data?: Record<string, any>): void;
  info(message: string, data?: Record<string, any>): void;
  warn(message: string, data?: Record<string, any>): void;
  error(message: string, error?: Error | unknown, data?: Record<string, any>): void;
  child(additionalContext: LogContext): Logger;
}

/**
 * Create a structured logger with optional context
 */
export function createLogger(context?: LogContext): Logger {
  const logContext = context || {};

  function log(level: LogLevel, message: string, data?: Record<string, any>, error?: Error | unknown) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    // Add context if present
    if (Object.keys(logContext).length > 0) {
      entry.context = logContext;
    }

    // Add additional data if present
    if (data && Object.keys(data).length > 0) {
      entry.data = data;
    }

    // Add error details if present
    if (error) {
      if (error instanceof Error) {
        entry.error = {
          message: error.message,
          name: error.name,
          stack: error.stack,
        };
      } else if (typeof error === "string") {
        entry.error = { message: error };
      } else {
        entry.error = { message: String(error) };
      }
    }

    // Output to appropriate console method
    const output = JSON.stringify(entry);
    switch (level) {
      case "error":
        console.error(output);
        break;
      case "warn":
        console.warn(output);
        break;
      case "debug":
        console.debug(output);
        break;
      default:
        console.log(output);
    }
  }

  return {
    debug(message: string, data?: Record<string, any>) {
      log("debug", message, data);
    },

    info(message: string, data?: Record<string, any>) {
      log("info", message, data);
    },

    warn(message: string, data?: Record<string, any>) {
      log("warn", message, data);
    },

    error(message: string, error?: Error | unknown, data?: Record<string, any>) {
      log("error", message, data, error);
    },

    child(additionalContext: LogContext): Logger {
      return createLogger({ ...logContext, ...additionalContext });
    },
  };
}

/**
 * Generate a random request ID for tracking
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}
