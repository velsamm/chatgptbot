import OpenAI from 'openai'
import { OPENAI_API_KEY, OPENAI_MODEL, OPENAI_ROLE } from '../constants'
import { logger } from '../logger/logger'

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
})

export async function chatWithChatGPT(requestMessage: string, telegramId: number, onResponse: (message: string) => void) {
    const completion = await openai.chat.completions.create({
        messages: [{ role: OPENAI_ROLE, content: requestMessage }],
        model: OPENAI_MODEL,
    })
    logger.info({ prefix: `Response message for user ${telegramId}:`, message: completion.choices })
    
    completion.choices.forEach(choice => {
        if (choice.message.content) {
            onResponse(choice.message.content)
        } else {
            logger.info({ prefix: 'Missing message content', message: choice })
        }
    })
}