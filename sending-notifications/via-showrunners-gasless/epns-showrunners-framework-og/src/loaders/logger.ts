import winston from 'winston';
require ('winston-daily-rotate-file');
const moment = require('moment'); // time library

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    simulate: 4,
    input: 5,
    saved: 6,
    verbose: 7,
    debug: 8,
    silly: 9,
  },
  colors: {
    info: 'green',
    simulate: 'white bold dim',
    input: 'inverse bold',
    saved: 'italic white',
    debug: 'yellow',
  }
};

var options = {
  file: {
    level: 'verbose',
    filename: `${__dirname}/../../logs/app.log`,
    handleExceptions: true,
    json: true,
    maxSize: "5m", // 5MB
    maxFiles: "5d",
    // colorize: true,
  },
};

const parser = (param: any): string => {
  if (!param) {
    return '';
  }
  if (typeof param === 'string') {
    return param;
  }

  return Object.keys(param).length ? JSON.stringify(param, undefined, 2) : '';
};

const formatter = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf((info) => {
    const { timestamp, level, message, meta } = info;

    const ts = moment(timestamp).local().format('HH:MM:ss');
    const metaMsg = meta ? `: ${parser(meta)}` : '';

    return `${ts} ${level}    ${parser(message)} ${metaMsg}`;
  }),
  winston.format.colorize({
    all: true,
  }),
)

var transport = new (winston.transports.DailyRotateFile)(options.file);
transport.on('rotate', function(oldFilename, newFilename) {
  // do something fun
  console.log("login rotated from: %o | %o", oldFilename, newFilename)
});

const transports = [];
transports.push(
  transport,
  new winston.transports.Console({
    format: formatter
  }),
)

const LoggerInstance = winston.createLogger({
  level: 'debug',
  levels: customLevels.levels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports
});

winston.addColors(customLevels.colors);

export default LoggerInstance;
