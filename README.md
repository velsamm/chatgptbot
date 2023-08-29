## Сборка и запуск образа

    docker build --tag=chatgptbot .
    docker run --name=chatgptbot --detach --env BOT_TOKEN=<your_bot_token> --env OPENAI_API_KEY=<your_openapi_key> --env TELEGRAM_ID_WHITELIST=<telegram_id_list> chatgptbot

## Переменные окружения

    BOT_TOKEN=токен бота
    OPENAI_API_KEY=ключ openai
    TELEGRAM_ID_WHITELIST=белый список telegram id через запятую