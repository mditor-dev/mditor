import * as Path from 'path';
import { app } from 'electron';
import { createLogger, format, transports } from 'winston';
import type { DailyRotateFileTransportOptions } from 'winston-daily-rotate-file';
import 'winston-daily-rotate-file';

const { timestamp, json, combine, prettyPrint } = format;

const commonFileOptions: Partial<DailyRotateFileTransportOptions> = {
  maxSize: '10m',
  maxFiles: '10d',
  zippedArchive: true,
  datePattern: 'YYYY-MM-DD',
  dirname: Path.resolve(app.getPath('userData'), 'logs'),
};
export const logger = createLogger({
  level: 'info',
  defaultMeta: { service: 'user-service' },
  format: combine(timestamp({ format: () => new Date().toLocaleString() }), prettyPrint()),
  transports: [
    // - Write all logs with importance level of `error` or less to `error.log`
    new transports.DailyRotateFile({
      ...commonFileOptions,
      level: 'error', // error是手动调用的
      filename: 'error_%DATE%.log',
    } as DailyRotateFileTransportOptions),
    // - Write all logs with importance level of `info` or less to `combined.log`
    new transports.DailyRotateFile({
      ...commonFileOptions,
      filename: 'combined_%DATE%.log',
      format: combine(timestamp(), json()),
    } as DailyRotateFileTransportOptions),
  ],
  exceptionHandlers: [
    // exception是捕获的
    new transports.DailyRotateFile({
      ...commonFileOptions,
      filename: 'exceptions_%DATE%.log',
    } as DailyRotateFileTransportOptions),
  ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (!app.isPackaged) {
  logger.add(new transports.Console({ format: format.simple() }));
}
