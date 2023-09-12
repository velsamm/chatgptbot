import { Bot, GrammyError, HttpError } from 'grammy'

import { logger } from './logger/logger'
import { chatWithChatGPT } from './openai'
import { BOT_TOKEN, TELEGRAM_ID_WHITELIST } from './constants'

const telegramIdWhiteList = TELEGRAM_ID_WHITELIST.split(',').map(Number)
const allowedForAll = TELEGRAM_ID_WHITELIST.length < 1

const bot = new Bot(BOT_TOKEN)

bot.use(async (ctx, next) => {
    const telegramId = ctx.from?.id

    if (allowedForAll) {
        await next()
        return
    }

    if (telegramId && telegramIdWhiteList.includes(telegramId)) {
        await next()
        return
    }

    logger.info({
        prefix: 'Someone tried to get access to bot',
        message: ctx.from,
    })
})

bot.on('message', (ctx) => {
    const telegramId = ctx.from.id
    const message = ctx.msg.text
    if (!message) {
        logger.info({
            prefix: `Ignoring request message from user ${telegramId}`,
            message: ctx.msg,
        })
        ctx.reply('К сожалению, я умею обрабатывать только текстовые запросы', {
            reply_to_message_id: ctx.msg.message_id,
        })
        return
    }
    logger.info({ message, prefix: `Request message from user ${telegramId}:` })

    chatWithChatGPT(message, telegramId, async (incoming) =>
        ctx.reply(incoming, { reply_to_message_id: ctx.msg.message_id })
    )
})

bot.catch((err) => {
    const updateId = err.ctx.update.update_id
    const telegramId = err.ctx.from?.id
    logger.error(
        `Error while handling update ${updateId} for user ${telegramId}:`
    )

    const error = err.error
    if (error instanceof GrammyError) {
        logger.error({
            prefix: 'Error in request:',
            message: error.description,
        })
    } else if (error instanceof HttpError) {
        logger.error({ prefix: 'Could not contact Telegram:', message: error })
    } else {
        logger.error({ prefix: 'Unknown error:', message: error })
    }
})

process.once('SIGINT', () => bot.stop())
process.once('SIGTERM', () => bot.stop())

bot.start({ drop_pending_updates: true })

logger.info({ message: 'Bot started' })
