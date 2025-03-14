// Добавляем Express для поддержания активности Replit
const express = require("express");
const app = express();

// Подключаем Discord.js и child_process
const { Client, GatewayIntentBits } = require("discord.js");
const { exec, spawn } = require("child_process");

// Создаём экземпляр клиента Discord
const discordBot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// **ВАЖНО!** Никогда не публикуйте токен в публичном доступе
const TOKEN =
  "MTM0MTU1OTY2OTgwMTYxNTQ0Mg.GqjXbD.4ggB5s_kaPfOBADtJOHUrLLQLVlVg0ccb8WmoI"; // Укажите токен бота
const ALLOWED_USERS = ["1097801058723565598", "883616030310678559"]; // Массив разрешенных пользователей

// Обработка команд через сообщение
discordBot.on("messageCreate", (message) => {
  if (message.author.bot) return;

  const args = message.content.split(" ");
  const command = args.shift().toLowerCase();

  // Команда !exec с использованием exec и увеличенным maxBuffer
  if (command === "!exec") {
    if (!ALLOWED_USERS.includes(message.author.id)) {
      message.reply("⛔ У тебя нет прав на выполнение команд!");
      return;
    }

    const execCommand = args.join(" ");

    // Разрешаем выполнять только команды, начинающиеся с "node"
    if (!execCommand.startsWith("node ")) {
      message.reply("⚠️ Разрешено выполнять только команды Node.js!");
      return;
    }

    // Проверка на запрещенные символы
    if (/[\;&|`$><]/.test(execCommand)) {
      message.reply("⚠️ Обнаружены запрещенные символы в команде!");
      return;
    }

    // Ограничение длины команды (чтобы предотвратить перегрузку)
    if (execCommand.length > 100) {
      message.reply("⚠️ Команда слишком длинная!");
      return;
    }

    exec(
      execCommand,
      { maxBuffer: 1024 * 1024 * 10 },
      (error, stdout, stderr) => {
        if (error) {
          message.reply(`❌ Ошибка:\n\`${error.message}\``);
          return;
        }
        if (stderr) {
          message.reply(`⚠️ Ошибка выполнения:\n\`${stderr}\``);
          return;
        }
        message.reply(`✅ Результат:\n\`\`\`${stdout}\`\`\``);
      },
    );
  }

  // Команда !spawn с использованием spawn для потоковой обработки вывода
  if (command === "!spawn") {
    if (!ALLOWED_USERS.includes(message.author.id)) {
      message.reply("⛔ У тебя нет прав на выполнение команд!");
      return;
    }

    const spawnCommand = args.join(" ");

    // Разрешаем выполнять только команды, начинающиеся с "node"
    if (!spawnCommand.startsWith("node ")) {
      message.reply("⚠️ Разрешено выполнять только команды Node.js!");
      return;
    }

    // Проверка на запрещенные символы
    if (/[\;&|`$><]/.test(spawnCommand)) {
      message.reply("⚠️ Обнаружены запрещенные символы в команде!");
      return;
    }

    if (spawnCommand.length > 100) {
      message.reply("⚠️ Команда слишком длинная!");
      return;
    }

    const child = spawn(spawnCommand, { shell: true });
    let output = "";

    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      output += data.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        message.reply(`⚠️ Команда завершилась с кодом ${code}\n${output}`);
      } else {
        message.reply(`✅ Результат:\n\`\`\`${output}\`\`\``);
      }
    });
  }
});

// Запуск Discord-бота
discordBot.login(TOKEN);
