const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');
const axios = require('axios');
const express = require('express');
const app = express();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
app.get('/', (req, res) => {
    res.send('Telegram Bot is running!');
  });
  
  
  app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running...');
  });
  


  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
  
    const commands = [
      {
        command: '/trainstatus [train_number]',
        description: 'Get live status of a train',
        example: '/trainstatus 12987',
      },
      {
        command: '/pnrstatus [pnr_number]',
        description: 'Get PNR status',
        example: '/pnrstatus 6122024867',
      },
    ];
  
    let response = '🚂 <b>Train Bot Commands</b> 🚂\n\n';
    response += 'Here are some available commands:\n\n';
  
    commands.forEach((cmd) => {
      response += `<b>${cmd.command}</b>\n`;
      response += `Description: ${cmd.description}\n`;
      response += `Example: ${cmd.example}\n\n`;
    });
  
    response += 'Start exploring and have a great journey! ✨';
  
    bot.sendMessage(chatId, response, { parse_mode: 'HTML' });
  });
bot.onText(/\/trainstatus (.+)/, async (msg, match) => {
    console.log('Received trainstatus command');
    const chatId = msg.chat.id;
    const trainNumber = match[1];
    const currentDate = new Date();
    const dateOptions = getDateOptions(currentDate);
  
    // Send a message asking the user to select a date
    bot.sendMessage(chatId, 'Please select a date:', {
      reply_markup: {
        inline_keyboard: dateOptions.map((dateOption) => [
          {
            text: dateOption.label,
            callback_data: `${trainNumber}-${dateOption.date}`,
          },
        ]),
      },
    });
  });

  bot.on('callback_query', async (query) => {
    console.log('Received callback query');
    const chatId = query.message.chat.id;
    const [trainNumber, selectedDate] = query.data.split('-');
  
    console.log('Train number:', trainNumber);
    console.log('Selected date:', selectedDate);
  
    try {
      const trainStatus = await getTrainStatus(trainNumber, selectedDate);
      console.log('Train status:', trainStatus);
      bot.sendMessage(chatId, trainStatus);
    } catch (error) {
      console.log('Error fetching train status:', error);
      bot.sendMessage(chatId, 'An error occurred while fetching train status. Please try again later.');
    }
  });
async function getTrainStatus(trainNumber, date) {
  const browser = await puppeteer.launch(
    {
        args: [
          "--disable-setuid-sandbox",
          "--no-sandbox",
          "--single-process",
          "--no-zygote",
        ],
        executablePath:
          process.env.NODE_ENV === "production"
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
      }
  );
  const page = await browser.newPage();
  const url = `https://runningstatus.in/status/${trainNumber}-on-${date}`;

  await page.goto(url);
  await page.waitForSelector('.card-header');

  const trainStatusElement = await page.$('.card-header');
  const extractedText = await page.evaluate((cardReader) => {
    const smallTags = cardReader.querySelectorAll('small');
    smallTags.forEach((smallTag) => {
      smallTag.parentNode.removeChild(smallTag);
    });
  
    const aTags = cardReader.querySelectorAll('a');
    aTags.forEach((aTag) => {
      aTag.parentNode.removeChild(aTag);
    });
  
    return cardReader.textContent.trim();
  }, trainStatusElement);
  console.log(extractedText);
  const trainStatus = await page.evaluate((element) => element.textContent, trainStatusElement);

  await browser.close();

  return trainStatus.trim();
}

function getDateOptions(currentDate) {
  const dateOptions = [];
  const numberOfPreviousDates = 3;
  const numberOfNextDates = 1;

  for (let i = numberOfPreviousDates; i > 0; i--) {
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - i);
    dateOptions.push({
      date: formatDate(previousDate),
      label: formatDateLabel(previousDate),
    });
  }

  dateOptions.push({
    date: formatDate(currentDate),
    label: formatDateLabel(currentDate),
  });

  for (let i = 1; i <= numberOfNextDates; i++) {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + i);
    dateOptions.push({
      date: formatDate(nextDate),
      label: formatDateLabel(nextDate),
    });
  }

  return dateOptions;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
}

function formatDateLabel(date) {
  const options = { month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}


bot.onText(/\/pnrstatus (.+)/, async (msg, match) => {
    console.log('Received pnrstatus command');
    const chatId = msg.chat.id;
    const pnrNumber = match[1];
  
    try {
      const pnrStatus = await getPnrStatus(pnrNumber);
      bot.sendMessage(chatId, pnrStatus, { parse_mode: 'HTML' });
    } catch (error) {
      console.log('Error fetching PNR status:', error);
      bot.sendMessage(chatId, 'An error occurred while fetching PNR status. Please try again later.');
    }
  });

  async function getPnrStatus(pnrNumber) {
    const options = {
      method: 'GET',
      url: `https://pnr-status-indian-railway.p.rapidapi.com/pnr-check/${pnrNumber}`,
      headers: {
        'X-RapidAPI-Key': process.env.API_TOKEN,
        'X-RapidAPI-Host': 'pnr-status-indian-railway.p.rapidapi.com'
      }
    };
  
    try {
      const response = await axios.request(options);
      console.log(response.data);
      const pnrData = response.data.data;
  
      let message = `<b>PNR Status:</b>\n\n`;
      message += `🚂 <b>Train:</b> ${pnrData.trainInfo.trainNo} - ${pnrData.trainInfo.name}\n`;
      message += `📍 <b>Boarding:</b> ${pnrData.trainInfo.boarding}\n`;
      message += `🚩 <b>Destination:</b> ${pnrData.trainInfo.destination}\n\n`;
      message += `📅 <b>Boarding Date:</b> ${pnrData.trainInfo.dt}\n\n`;
      message += `<b>Passenger Information:</b>\n`;
      message += `🚋 <b>Current Coach:</b> ${pnrData.passengerInfo[0].currentCoach}\n`;
      message += `💺 <b>Current Berth No:</b> ${pnrData.passengerInfo[0].currentBerthNo}\n`;
  
      return message;
    } catch (error) {
      throw new Error('Error fetching PNR status');
    }
  }