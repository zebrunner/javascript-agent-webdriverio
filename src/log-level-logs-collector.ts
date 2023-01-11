import log from "loglevel"
import util from "util"

export class LogLevelLogsCollector {

    private readonly messageCollector: (loggerName: string, logLevel: string, message: string) => Promise<void>

    constructor(messageCollector: (loggerName: string, logLevel: string, message: string) => Promise<void>) {
        this.messageCollector = messageCollector

        this.replaceLoggerMethodFactory(log)
        Object.values(log.getLoggers())
            .forEach(logger => this.replaceLoggerMethodFactory(logger))
    }

    private replaceLoggerMethodFactory(logger) {
        const messageCollector = this.messageCollector
        const originalFactory = logger.methodFactory

        logger.methodFactory = function (methodName, logLevel, loggerName) {
            const originalMethod = originalFactory(methodName, logLevel, loggerName)

            return async (...args) => {
                originalMethod(...args)

                const message = util.format.apply(this, args as [format: string, ...params: string[]])
                await messageCollector(loggerName, methodName, message)
            }
        }

        // to re-initialize logger methods
        logger.setLevel(logger.getLevel())
    }

}
