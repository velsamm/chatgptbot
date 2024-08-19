import { Bot, GrammyError, HttpError } from 'grammy'

import { logger } from './logger/logger'
import { chatWithChatGPT } from './openai'
import { BOT_TOKEN, TELEGRAM_ID_WHITELIST } from './constants'
import { stat } from "./stats/stats";
import { InputFile } from "grammy/out/types.node";

const telegramIdWhiteList = TELEGRAM_ID_WHITELIST ? TELEGRAM_ID_WHITELIST.split(',') : []
const allowedForAll = TELEGRAM_ID_WHITELIST.length < 1

const bot = new Bot(BOT_TOKEN)

bot.use(async (ctx, next) => {
    const telegramId = ctx.from?.id

    if (allowedForAll) {
        await next()
        return
    }

    if (telegramId && telegramIdWhiteList.includes(telegramId.toString())) {
        await next()
        return
    }

    logger.info({
        prefix: 'Someone tried to get access to bot',
        message: ctx.from,
    })
})

bot.use(async (ctx, next) => {
    const message = ctx.message?.text

    if (message === '/status') {
        const { answeredRequestAmount, totalRequestAmount, failedRequestAmount, requestMap } = stat
        const commonStatMessage = [
            `Данные по текущей сессии:\n`,
            `*Всего запросов:* ${totalRequestAmount}\n`,
            `*Отвечено запросов:* ${answeredRequestAmount}\n`,
            `*Отвалилось запросов:* ${failedRequestAmount}\n`,
            `*Запросы в ожидании:* ${totalRequestAmount - answeredRequestAmount - failedRequestAmount}`,
        ].join('')

        let requestMapMessage = '*Telegram ID* - Количество запросов\n'
        requestMap.forEach((value, key) => {
            requestMapMessage += `*${key}* - ${value} \n`
        })

        const message = commonStatMessage + '\n\n\n' + requestMapMessage

        await ctx.reply(message, { parse_mode: 'Markdown' })

        return
    }

    await next()
})

bot.on('message', async (ctx) => {
    const telegramId = ctx.from.id
    const message = ctx.msg.text
    if (!message) {
        logger.info({
            prefix: `Ignoring request message from user ${telegramId}`,
            message: ctx.msg,
        })
        await ctx.reply('К сожалению, я умею обрабатывать только текстовые запросы :(', {
            reply_to_message_id: ctx.msg.message_id,
        })
        return
    }
    logger.info({ message, prefix: `Request message from user ${telegramId}:` })

    stat.increaseTotalRequestAmount()
    stat.increaseRequestMapCounter(telegramId)

    const dummyMessage = await ctx.reply('Вычисляю... 🤖', {
        reply_to_message_id: ctx.msg.message_id
    })

    chatWithChatGPT(message, telegramId, async (incoming) => {
        if (incoming.length > 4096) {
            const uint8Array = new TextEncoder().encode(incoming)
            ctx.replyWithDocument(new InputFile(uint8Array, 'gpt_response.md'), {
                message_thread_id: dummyMessage.message_id
            }).then(() => {
                stat.increaseAnsweredRequestAmount()
            })
              .catch(async error => {
                  stat.increaseFailedRequestAmount();
                  // @ts-ignore
                  await ctx.editMessageText('⚠️ Возникла ошибка. Попробуйте еще раз', { message_id: dummyMessage.message_id })

                  logger.error({prefix: 'Error during sending message:', message: error})
              })
        } else {
            // @ts-ignore
            ctx.editMessageText(incoming, { message_id: dummyMessage.message_id })
              .then(() => {
                  stat.increaseAnsweredRequestAmount()
              })
              .catch(async error => {
                  stat.increaseFailedRequestAmount();
                  // @ts-ignore
                  await ctx.editMessageText('⚠️ Возникла ошибка. Попробуйте еще раз', { message_id: dummyMessage.message_id })

                  logger.error({prefix: 'Error during sending message:', message: error})
              })
        }
    })
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
