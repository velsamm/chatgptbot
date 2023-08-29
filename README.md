## Сборка и запуск образа

    docker build --tag=chatgptbot .
    docker run --name=chatgptbot --detach --env BOT_TOKEN=<your_bot_token> --env OPENAI_API_KEY=<your_openapi_key> chatgptbot
