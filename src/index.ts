import { Bot } from "grammy";

import { logger } from './logger/logger'
import { chatWithChatGPT } from './openai'
import { BOT_TOKEN } from "./constants";

const bot = new Bot(BOT_TOKEN); 

bot.command("start", (ctx) => ctx.reply("Добро пожаловать!! Какой у вас вопрос?"));

bot.on('message', (ctx) => {
    const telegramId = ctx.from.id
    const message = ctx.msg.text
    if (!message) {
        logger.info({ prefix: `Ignoring request message from user ${telegramId}`, message: ctx.msg })
        ctx.reply('К сожалению, я умею обрабатывать только текстовые запросы', { reply_to_message_id: ctx.msg.message_id })
        return
    }
    logger.info({ message, prefix: `Request message from user ${telegramId}:` })
    chatWithChatGPT(message, telegramId, (incoming) =>
        ctx.reply(incoming, { reply_to_message_id: ctx.msg.message_id })
    )
})

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

bot.start()

logger.info({ message: 'Bot started' })
