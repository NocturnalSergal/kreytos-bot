const https = require("https");

let msIP = "192.99.160.99";

function list(msg) {
  https.get(url, function(res) {
    let body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      let result = JSON.parse(body)
      //msg.channel.send("There are " + result.players.online + " players online");
      let playersTOT = "";
      for (let i = 0; i < result.players.sample.length; i++) {
        playersTOT += result.players.sample[i].name + ', ';
      }
      //if (playersTOT < 1) return;

      if (playersTOT < 1) {
        msg.channel.send("There are no players online");
      } else {
        msg.channel.send("There are " + result.players.online + " players online. " + playersTOT);
      }

    });
  }).on('error', function(e) {
    console.log("Error: " + e.message);
  });
}
function stats(msg) {
  https.get(url, function(res) {
    msg.channel.send("TFC server is up and running!")
  }).on('error', function(e) {
    msg.channel.send("TFc server is offline");
  });
}
function motd(msg) {
  https.get(url, function(res) {
    let body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      let result = JSON.parse(body)
      msg.channel.send("Message of the Day : " + result.description);
    });
  }).on('error', function(e) {
    console.log("Error: " + e.message);
  });
}
function maxplayers(msg) {
  https.get(url, function(res) {
    let body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      let result = JSON.parse(body)
      msg.channel.send("Max players : " + result.players.max);
    });
  }).on('error', function(e) {
    console.log("Error: " + e.message);
  });
}

exports.list = list;
exports.stats = stats;
exports.motd = motd;
exports.maxplayers = maxplayers;

var url = "https://api.minetools.eu/ping/192.99.160.99/25565";
