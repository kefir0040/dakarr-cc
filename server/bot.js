const {
  Client,
  GatewayIntentBits,
  TextChannel,
  EmbedBuilder,
} = require("discord.js");
const commands = global.chatCommands;
const Events = global.Events;
const wsServer = global.wsServer;
const tags = global.tags;

let client;

const log = function (c, message) {
  const channel = client.channels.cache.get(c);
  if (channel instanceof TextChannel) {
    channel.send(`\`[${new Date().toLocaleString()}] ${message}\``);
  }
};

module.exports.log = log;

client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  log("logs", `[bot.js] Bot is up`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith("$")) {
    const [cmd, ...args] = message.content.trim().slice(1).split(/ +/);

    if (cmd === "run") {                            // DEVELOPER            // HEAD STAFF          // INGAME MODERATOR
      if (!message.member.roles.cache.some((role) =>["1252447440788000890", "1252446810488832040", "1257094749400334377"].includes(role.id))) return;
      const id = args[0];
      const command = args[1];
      const arg = args.slice(2).join(" ");
      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Command Execution")
        .setDescription(
          `Attempting to run /${command} ${arg} as ID ${id}`,
        )
        .setTimestamp();
      message.reply({ embeds: [embed] });
      runCommand(id, command, arg);
    } else if (cmd === "restore") {                 // DEVELOPER            // RESTORE PERMS       // INGAME MODERATOR    // HEAD STAFF
      if (!message.member.roles.cache.some((role) =>["1252447440788000890", "1269093498389401640", "1257094749400334377", "1252446810488832040"].includes(role.id))) return;
      const id = args[0];
      const arg = args[1]
      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("Restore")
        .setDescription(
          `Attempting to restore ID ${id} to score ${arg}`,
        )
        .setTimestamp();
      message.reply({ embeds: [embed] });
      restorePlayer(id, arg);
    } else if (cmd === "playerlist") {//             // DEVELOPER            // HEAD STAFF          // INGAME MODERATOR
      if (!message.member.roles.cache.some((role) => ["1252447440788000890", "1252446810488832040", "1257094749400334377"].includes(role.id))) return;
      
    let playerList = "";
    wsServer.clients.forEach(client => {
      if (client.player && client.player.body) {
        playerList += `${client.player.body.name} **|** ${tags.add(client.player.body)}\n`;
      }
    });

    const embed = new EmbedBuilder()
      .setColor("#ff0000")
      .setTitle("Player List")
      .setDescription(playerList || "No players found.")
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
  }
});

client.login(process.env.BOT_TOKEN).catch(console.error);
global.log = log;

function parseScore(scoreString) {
  const regex = /^([\d,.]+)([kKmM]?)$/;
  const match = scoreString.match(regex);
  
  if (!match) return console.log("Invalid score");

  let value = parseFloat(match[1].replace(/,/g, ''));
  const suffix = match[2].toLowerCase();

  switch (suffix) {
      case 'k':
          value *= 1000; // 1k = 1000
          break;
      case 'm':
          value *= 1000000; // 1m = 1,000,000
          break;
  }
  
  return value;
}

function restorePlayer(id, score) {
  let socket;
  wsServer.clients.forEach(client => {
      if (client.player && tags.add(client.player.body) == id) {
          socket = client;
          console.log(`Checking player ID: ${tags.add(client.player.body)} against ${id}`);
      }
  });

  if (socket) {
      const parsedScore = parseScore(score);
      
      if (parsedScore !== null) {
          console.log("Restoring a player to score:", parsedScore);
          socket.player.body.skill.score = parsedScore;
      } else {
          console.log(`Invalid score format: ${score}`);
      }
  } else {
      console.log(`No player found for ID: ${id}`);
  }
}

function runCommand(id, command, args) {
  let abort = false;
  console.log(args)
  let message = `/${command} ${Array.isArray(args) ? args.join(" ") : args}`;
  let socket;
  //if ((command === "level" && args > 999) || (command === "lvl" && args > 999)) return;

  wsServer.clients.forEach(function (client) {
    if (
      client &&
      client.player &&
      client.player.body &&
      tags.add(client.player.body) == id
    ) {
      socket = client;
      return;
    }
  });

  if (socket) {
    if (!socket.player.body) return;
    if (!socket.permissions) {
      socket.permissions = {};
    }
    socket.permissions.class = "developer";
    commands.update(
      {
        socket,
        player: socket.player,
        body: socket.player.body,
      },
      () => (abort = true),
    );
    const commandArgs = message.slice(1).split(" ");
    console.log(message);
    commands.on(commandArgs.shift().toLowerCase(), commandArgs);
    socket.permissions.class = {};
  } else {
    log("logs", `[INFO] ID ${id} not found`);
  }
}