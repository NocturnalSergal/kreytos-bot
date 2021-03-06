const Discord = require("discord.js");
const https = require("https");

var MojangAPI = require('mojang-api');
const uuidParse = require('uuid-parse');

const config = require("./config.json");

const client = new Discord.Client();
const sql = require('mysql');
//Connect to the Database//
const con = sql.createConnection({
  host: config.mysqlip,
  user: config.mysqluser,
  password: config.mysqlpassword,
  database: config.mysqldatabase
});
//On Connection Throw a Log saying "Connected"//
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

// server shit
const GeneralChat = config.general; // Enter TextChannel for Welcome/Goodbye Messages;
const LogChat = config.logs;
const ModCmdRole = "Owner"; // Enter role for Admin commands;
const ServerChat = config.server;
// cmds SHIT

const tfc = require('./commands/tfcCMDs.js');
const hrz3 = require('./commands/horizonCMDs.js');
//const economy = require('./commands/economy.js');
const EcoNew = require('./commands/EcoNew.js');
// TESTING MC SERVER shit

// minestat shit
var url = "https://api.minetools.eu/ping/192.99.160.99/25565";

let previous_players;
let playersUpdate = [];

let msIP = "192.99.160.99"; // IP of the server

let dailyLoot = [];

// Bootup Messages
client.on('ready', () => {
  console.log(`Bot logged in as ${client.user.tag}!`);

  https.get(url, function(res) {
    let body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      let result = JSON.parse(body);

      previous_players = result.players.online;
      for (let ab = 0; ab < result.players.sample.length; ab++) {
        playersUpdate.push(result.players.sample[ab].name);
      }

    });
  }).on('error', function(e) {
    console.log("Error: " + e.message);
  });

  EcoNew.onStart();
});

// CMDs
client.on('message', msg => {

  if (msg.author.id == 374649577489563650) {
    if ( msg.content.includes("LINK") ) {
      let args = msg.content.split(" ").slice(0);
      var Truncate1 = args[0].replace("`", "");
      var Truncate2 = Truncate1.replace("`", "");
      var Username = Truncate2.replace(":", "");
      var password = args[2];

      con.query(`SELECT * FROM Name WHERE uuid = '${password}'`, function(err, result) {
        if ( typeof result[0] == "undefined" ) {
          client.channels.get(config.server).send("Sorry that password is invalid check your password and try again.");
          return;
        }
        else{
          MojangAPI.nameToUuid(Username, function(err,result){
            uuidunparse = result[0].id
            uuidbytes = uuidParse.parse(uuidunparse);
            uuid = uuidParse.unparse(uuidbytes)
            con.query(`UPDATE Name SET uuid = '${uuid}' WHERE uuid = '${password}'`)
            client.channels.get(config.server).send("Account Linked. Enjoy the Economy.")
          })
        }
      })
    }
    else{
      return;
    }
  }

  if(!msg.content.startsWith(config.prefix)) return;

  let modRole = msg.guild.roles.find("name" , ModCmdRole);

  let cmd = msg.content.split(" ")[0];
  cmd = cmd.slice(config.prefix.length);

  let args = msg.content.split(" ").slice(1);

  let ecoCMDS = ["level", "bal", "daily", "pay", "clear", "link"];
  let ecoFuncs = [
    EcoNew.getLevel,
    EcoNew.getBal,
    EcoNew.getDaily,
    EcoNew.pay,
    EcoNew.clearBal,
    EcoNew.Link
  ];

  for (let i = 0; i < ecoCMDS.length; i++) {
    if (cmd === ecoCMDS[i]) {
      ecoFuncs[i](msg, con);
    }
  }

  let chestCMDS = ['buy', 'use', 'amt'];
  let chestFuncs = [
    EcoNew.buyChest,
    EcoNew.useChest,
    EcoNew.balChest,
  ];

  for(let i = 0; i < chestCMDS.length; i++) {
    if (args[0] === chestCMDS[i] && cmd === "ch") {
      chestFuncs[i](msg, con);
    } else if (args[0] === chestCMDS[i] && cmd === "chest") {
      chestFuncs[i](msg, con);
    }
  }

  let tfcCMDS = ["list", "status", "motd", "maxP"];
  let tfcFuncs = [
    tfc.list,
    tfc.stats,
    tfc.motd,
    tfc.maxplayers
  ];

  for (let i = 0; i < tfcCMDS.length; i++) {
    if (args[0] === tfcCMDS[i] && cmd === "tfc") {
      tfcFuncs[i](msg);

    }
  }

  let hrz3CMDS = ["list", "status", "motd", "maxP"];
  let hrz3Funcs = [
    hrz3.list,
    hrz3.stats,
    hrz3.motd,
    hrz3.maxplayers
  ];

  for (let i = 0; i < hrz3CMDS.length; i++) {
    if (args[0] === hrz3CMDS[i] && cmd === "hrz3") {
      hrz3Funcs[i](msg);

    }
  }

  if (cmd === "shutdown") {
    if (msg.author.id == "270017065300131840" || member.author.id == "190006124232048640") {
      EcoNew.dailyClear(client, sql, LogChat);
      msg.reply("Ok! Shutting down.")
      setTimeout(function() {process.exit()}, 1000);
      return;

    } else {
      msg.reply("You do not have the permissions!");
      return;

    }
  }

});

let serverOn = true;
var PlayerUpdate = function() {
  // THIS IS FOR CHECKING IF PEOPLE ARE JOINING OR LEAVEING TFC
  https.get(url, function(res) {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      let result = JSON.parse(body)

      if(result.error && serverOn) {
        client.channels.get(LogChat).send("Fetching TFC Info: " + result.error);
        console.log(result);
        serverOn = false;
        return;

      } else {
        if (result.error) return;
        serverOn = true;
      }

      if (result.players.online > previous_players) {
        let FocusUser;

        for (let ab = 0; ab < result.players.online; ab++) {
          if (!playersUpdate.includes(result.players.sample[ab].name)) {
            FocusUser = result.players.sample[ab].name;
            client.channels.get(ServerChat).send(FocusUser + " has logged in.");
          }
        }

      }

      if (previous_players > result.players.online) {
        let FocusUser;
        let NowUsers = [];

        for (let ab = 0; ab < result.players.online; ab++) {
          NowUsers.push(result.players.sample[ab].name);
        }

        for (let aa = 0; aa < playersUpdate.length; aa++) {
          if (!NowUsers.includes(playersUpdate[aa])) {
            FocusUser = playersUpdate[aa];
            client.channels.get(ServerChat).send(FocusUser + " has logged out.");
          }
        }
      }

      playersUpdate = [];
      for (let ab = 0; ab < result.players.online; ab++) {
        playersUpdate.push(result.players.sample[ab].name);
      }
      previous_players = result.players.online;
    });
  }).on('error', function(e) {
    console.log("Error: " + e.message);
  });
}

setInterval(PlayerUpdate, 1000);

function DBKeepalive(con) {
  con.query(`SELECT * FROM Name WHERE id = 1`, function(err,result){
    id = result[0].id;
    con.query(`UPDATE Name SET id = ${id} WHERE id = ${id}`)
  })
}

setInterval(PlayerUpdate, 1000 * 60 * 30);

// Login to Discord
exports.con = con;
client.login(config.token);
