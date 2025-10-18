import winston from 'winston';
import { Config } from '../config/config';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

const logger = winston.createLogger({
  level: Config.isDevelopment() ? 'debug' : 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

// Create a stream object for Morgan middleware
export const loggerStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export default logger;
