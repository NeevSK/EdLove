import pino from 'pino';

export const logger = pino({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  base: {
    env: process.env.NODE_ENV,
    platform: 'core',
  },
  // In development, we allow pino-pretty if available in the environment
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        }
      : undefined,
});

/**
 * Create a context-aware child logger.
 * RECOMMENDED: Call this at the start of every request/session.
 */
export const createChildLogger = (context: {
  schoolId?: string;
  userId?: string;
  module?: string;
}) => {
  return logger.child(context);
};

export default logger;
