import winston from 'winston'

const env = process.env.NODE_ENV || 'production'
const {
    combine,
    timestamp,
    label,
    printf,
    splat,
    errors,
    colorize,
} = winston.format

const myFormat = printf(
    ({ prefix, level, message, label, timestamp, stack }) => {
        prefix = prefix ?? ''
        message =
            typeof message === 'string' ? message : JSON.stringify(message)

        let format = `${timestamp} [${label}] ${level} ${prefix} ${message}`

        if (stack) {
            format = format + ` ${stack && stack}`
        }

        return format
    }
)

const createLogger = () =>
    winston.createLogger({
        level: 'info',
        format: combine(
            errors({ stack: true }),
            label({ label: 'chatgpt' }),
            timestamp(),
            splat(),
            myFormat
        ),
        silent: false,
        transports: [new winston.transports.Console()],
    })

export const logger = createLogger()

if (env === 'development') {
    logger.format = combine(
        logger.format,
        colorize()
    )
}
