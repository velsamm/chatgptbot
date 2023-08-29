import OpenAI from 'openai'
import { OPENAI_API_KEY } from '../constants'
import { logger } from '../logger/logger'

const OPENAI_MODEL = 'gpt-3.5-turbo'
const OPENAI_ROLE = 'user'

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
})

export async function chatWithChatGPT(requestMessage: string, onResponse: (message: string) => void) {
    const completion = await openai.chat.completions.create({
        messages: [{ role: OPENAI_ROLE, content: requestMessage }],
        model: OPENAI_MODEL,
    })
    logger.info({ prefix: 'Response message:', message: completion.choices })

    completion.choices.forEach(choice => {
        if (choice.message.content) {
            onResponse(choice.message.content)
        } else {
            logger.info({ prefix: 'Missing message content', message: choice })
        }
    })
}