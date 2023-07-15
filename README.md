# 🚂 Indian Railway Telegram Bot

Welcome to the Indian Railway Telegram Bot! This bot allows you to get live train status and PNR status right from your Telegram chat. It provides real-time information about train schedules, locations, and passenger status.
## Username - (@IRCTCTrackMyTrain_bot)
## Features

✅ Live train status updates  
✅ PNR status checking  
✅ User-friendly commands and interaction  

## Usage

1. Start the bot by sending `/start` command.
2. Use the following commands to interact with the bot:

   - `/trainstatus [train_number]` - Get live status of a train. Example: `/trainstatus 12987`
   - `/pnrstatus [pnr_number]` - Get PNR status. Example: `/pnrstatus 6122024867`

3. Follow the prompts and select options to get the desired information.

## Deployment

The bot is deployed on ⚡️ Render, a modern cloud platform for web apps, APIs, and static sites.

To deploy the bot to Render:

1. Clone this repository: `git clone https://github.com/ankush28/indian-railway-telegram-bot.git`
2. Navigate to the project directory: `cd indian-railway-telegram-bot`
3. Update the necessary environment variables in the `.env` file.
4. Commit and push your changes to your Render repository.
5. Configure the Render settings for your deployment (e.g., region, instance size, etc.).
6. Start the deployment and wait for the bot to be live on Render.

## Dependencies

The bot is built using the following technologies and libraries:

- Node.js
- Telegram Bot API
- Puppeteer
- Axios
- Express

Make sure to install the required dependencies before running the bot: npm install

## Credits

This Telegram bot was created by ✨ Ankush Choudhary ✨.

## License

This project is licensed under the [MIT License](LICENSE).
