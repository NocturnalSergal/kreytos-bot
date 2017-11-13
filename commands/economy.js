var con = require('mysql');



var GetLem = function(db) {
  var lim = 0;

  
//lim = sql.(`SELECT count(id) from SCORES`).then(function(UpdateDaily){
  //leg = JSON.stringify(UpdateDaily);
  //var lem = parseInt(UpdateDaily);
   //for (var i = 0, len = lem; i < len; i++) {
    //sql.get(`SELECT daily FROM scores WHERE id ="${i}"`).then(row => {
      //if (row.daily > 0) {
        //sql.run(`UPDATE scores SET daily = ${row.daily--} WHERE id = ${i}`);
      //}
    //});
 // }
//})

 
}



function dailyClear(client, sql, LogChat) {
  db.get(`SELECT daily FROM scores`).then(row => {
    db.run(`UPDATE scores SET daily = ${0}`);
    client.channels.get(LogChat).send("Cleared daily cooldowns for all players");
  });
}

function getLevel(msg, sql) {
  sql.get(`SELECT * FROM scores WHERE userId ="${msg.author.id}"`).then(row => {
    if (!row) return msg.reply("Your current level is 0");
    msg.reply(`Your current level is ${row.level}`);
  });
}
/*function getBal(msg, sql) {
  sql.get(`SELECT * FROM scores WHERE userId ="${msg.author.id}"`).then(row => {
    if (!row) return msg.reply("sadly you do not have any Ets yet!");
    msg.reply(`you currently have ${row.points} Ets, good going!`);
  });
}*/
function getDaily(msg, sql) {
  sql.get(`SELECT * FROM scores WHERE userId =${msg.author.id}`).then(row => {
    if (row.daily <= 0) {
      sql.run(`UPDATE scores SET points = ${row.points + 20} WHERE userId = ${msg.author.id}`);
      sql.run(`UPDATE scores SET chest = ${row.chest + 1} WHERE userId = ${msg.author.id}`);
      sql.run(`UPDATE scores SET daily = ${20} WHERE userId = ${msg.author.id}`);

      msg.reply("You have collected your daily loot");
    } else {
      sql.get(`SELECT daily FROM scores WHERE userId ="${msg.author.id}"`).then(row => {
        msg.reply("You have to wait " + row.daily +  " hours!");
      });
    }
  });
}
function pay(msg, sql) {
  if(msg.channel.type == "DM") return msg.channel.send("Cannot perform in dms!");

  let args = msg.content.split(" ").slice(1);


  if (typeof args[0] != "string") return msg.reply("Please input a user!!");

  let playerINP = "" + args[0];
  let inp = args[0];

  let getPlayer = "";

  playerINP = playerINP.split('');

  if (playerINP[0] != "<" || playerINP[1] != "@" || playerINP[playerINP.length-1] != ">") {
    msg.reply("Please input a user!")
    return;
  }

  for (let i = 2; i < playerINP.length-1; i++) {
    getPlayer += playerINP[i];
  }

  let sendPoints = parseInt(args[1]);
  if (sendPoints < 0) return msg.reply("You cannot send negative points to someone!");

  sql.get(`SELECT points FROM scores WHERE userId ="${msg.author.id}"`).then(row => {
    if (!row) return msg.reply("sadly you do not have any Ets yet!");
    if (row.points < sendPoints) return msg.reply("you don't have enough Ets!");
    sql.run(`UPDATE scores SET points = ${row.points - sendPoints} WHERE userId = ${msg.author.id}`);

    sql.get(`SELECT points FROM scores WHERE userId ="${getPlayer}"`).then(row => {
      sql.run(`UPDATE scores SET points = ${row.points + sendPoints} WHERE userId = ${getPlayer}`);
      msg.channel.send("You sent " + sendPoints + " Ets to " + inp)
    });
  });

}

function buyChest(msg, sql) {
  let args = msg.content.split(" ").slice(1);

  let chestAmt = 0;

  if (typeof args[1] != "string") {
    chestAmt = 1;
  } else {
    chestAmt = parseInt(args[1]);
  }

  if (chestAmt < 1) return msg.reply("You cannot buy chest amounts of 0 or less!");
  let amtPrice = chestAmt * 15;


  sql.get(`SELECT * FROM scores WHERE userId ="${msg.author.id}"`).then(row => {
    if (row.points < amtPrice) { return msg.channel.send("You do not have enough Ets!")};

    sql.run(`UPDATE scores SET points = ${row.points - amtPrice} WHERE userId = ${msg.author.id}`);

    msg.reply("You purchased " + chestAmt + " chest. At price of " + amtPrice + " Ets");
    sql.run(`UPDATE scores SET chest = ${row.chest + chestAmt} WHERE userId = ${msg.author.id}`);
  });
}
function useChest(msg, sql) {
  let args = msg.content.split(" ").slice(1);

  let chestAmt = 0;

  if (typeof args[1] != "string") {
    chestAmt = 1;
  } else {
    chestAmt = parseInt(args[1]);
  }

  if (chestAmt < 0) return msg.reply("You cannot use chest amounts of 0 or less!");

  sql.get(`SELECT chest FROM scores WHERE userId ="${msg.author.id}"`).then(row => {
    if (row.chest < chestAmt) {
      msg.channel.send("You do not have enough chest!")
      return;

    } else {
      sql.run(`UPDATE scores SET chest = ${row.chest - chestAmt} WHERE userId = ${msg.author.id}`);

      let totalReward = 0;

      let intMythic = 0;
      let intLegendary = 0;
      let intElite = 0;
      let intRare = 0;
      let intUncommon = 0;
      let intCommon = 0;

      for (let i = 0; i < chestAmt; i++) {
        let ranNum = Math.random(0, 1) * 100;

        let reward = 0;
        let reName = "";

        if (ranNum < 0.2) { // MYTHIC
          reward = 250;
          reName = "Mythic";

        } else if (ranNum < 1.2) { // LEGENDARY
          reward = 125;
          reName = "Legendary";

        } else if (ranNum < 6.2) { // ELITE
          reward = 50;
          reName = "Elite";
 
        } else if (ranNum < 18.2) { // RARE
          reward = 30;
          reName = "Rare";

        } else if (ranNum < 38.5) { // UNCOMMON
          reward = 20;
          reName = "Uncommon";

        } else { // COMMON
          reward = 5;
          reName = "Common";

        }

        profit = reward;
        totalReward += profit;

        if (reName == "Mythic") { intMythic++}
        if (reName == "Legendary") { intLegendary++}
        if (reName == "Elite") { intElite++}
        if (reName == "Rare") { intRare++}
        if (reName == "Uncommon") { intUncommon++}
        if (reName == "Common") { intCommon++}
      }

      sql.get(`SELECT points FROM scores WHERE userId ="${msg.author.id}"`).then(row => {
        sql.run(`UPDATE scores SET points = ${row.points + totalReward} WHERE userId = ${msg.author.id}`);
      });

      //msg.channel.send("Congratz! You won " + totalReward + " Ets. \nLoot boxes: " + crates);

      let Message = "";

      if(intMythic >= 1) {Message = Message + "x" + intMythic  + "Mythic Lootboxes\n"}
      if(intLegendary >= 1) {Message = Message + "x" + intLegendary + "Legendary Lootboxes\n"}
      if(intElite >= 1) { Message = Message + "x" + intElite + "Elite Lootboxes\n"}
      if(intRare >= 1) {Message = Message + "x" + intRare + "Rare Lootboxes\n"}
      if(intUncommon >= 1) {Message = Message + "x" + intUncommon + "Uncommon Lootboxes\n"}
      if(intCommon >= 1) {Message = Message + "x" + intCommon + "Common Lootboxes\n"}


      msg.reply("Congratz! You Won " + totalReward + " Ets. \nLoot Boxes:\n" + Message)

    }
  });

}
function balChest(msg, sql) {
  sql.get(`SELECT chest FROM scores WHERE userId ="${msg.author.id}"`).then(row => {
    msg.channel.send("You have " + row.chest + " chest");
  });
}

function clearBal(msg, sql) {
  if(msg.channel.type == "DM") return msg.channel.send("Cannot perform in dms!");
  if(msg.author.id != "270017065300131840" && member.author.id != "190006124232048640") return msg.reply("You can't do that!");

  let args = msg.content.split(" ").slice(1);

  if (typeof args[0] != "string") return msg.reply("Please input a user!!");

  let playerINP = "" + args[0];
  let inp = args[0];

  let getPlayer = "";

  playerINP = playerINP.split('');

  if (playerINP[0] != "<" || playerINP[1] != "@" || playerINP[playerINP.length-1] != ">") {
    msg.reply("Please input a user!")
    return;
  }

  for (let i = 2; i < playerINP.length-1; i++) {
    getPlayer += playerINP[i];
  }

  sql.get(`SELECT * FROM scores WHERE userId ="${getPlayer}"`).then(row => {
    sql.run(`UPDATE scores SET points = ${0} WHERE userId = ${getPlayer}`);
    sql.run(`UPDATE scores SET chest = ${0} WHERE userId = ${getPlayer}`);
    sql.run(`UPDATE scores SET daily = ${0} WHERE userId = ${getPlayer}`);
    sql.run(`UPDATE scores SET level = ${0} WHERE userId = ${getPlayer}`);

    msg.channel.send("Successfully cleared the account of " + inp );
  });
}

function onStart() {
  setInterval(function() {GetLem()}, 1000);
}

exports.onStart = onStart;
exports.getLevel = getLevel;
//exports.getBal = getBal;
exports.getDaily = getDaily;
exports.pay = pay;

exports.useChest = useChest;
exports.buyChest = buyChest;
exports.balChest = balChest;

exports.clearBal = clearBal;
exports.dailyClear = dailyClear;
