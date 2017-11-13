const sql = require('mysql');
var MojangAPI = require('mojang-api');
const uuidParse = require('uuid-parse');
const config = require("../config.json");
//Connect to the Database//
const con = sql.createConnection({
  host: config.mysql-ip,
  user: config.mysql-user,
  password: config.mysql-password,
  database: config.mysql-database
});
// getting uuid func //

//Functions//

    // Balance //
        function getBal(msg, con) {
          con.query(`SELECT * FROM Name WHERE clientid = ${msg.author.id}` , function(err, result){
            uuid = result[0].uuid
            con.query(`SELECT * FROM accounts WHERE uid = "${uuid}"`, function (err, result) {
                money = result[0].ets_balance
                msg.reply("You have " + money + " ets")
            });
            });
        }

// Chests Ammount //

    function balChest(msg, con) {
        con.query(`SELECT * FROM Name WHERE clientid ="${msg.author.id}"`, function (err, result) {
            Chestamt = result[0].Chest
            msg.channel.send("You have " + Chestamt + " chest");
        });
    }


// Chest Use //

    function useChest(msg, con) {
      con.query(`SELECT * FROM Name WHERE clientid = ${msg.author.id}` , function(err, result){
  uuid = result[0].uuid

  let args = msg.content.split(" ").slice(1);

  let chestAmt = 0;

  if (typeof args[1] != "string") {
    chestAmt = 1;
  } else {
    chestAmt = parseInt(args[1]);
  }

  if (chestAmt < 0) return msg.reply("You cannot use chest amounts of 0 or less!");

  con.query(`SELECT * FROM Name WHERE clientid ="${msg.author.id}"`, function (err, result) {
    if (result[0].Chest < chestAmt) {
      msg.channel.send("You do not have enough chest!")
      return;
       
    } else {
      Change = result[0].Chest
      con.query(`UPDATE Name SET Chest = ${Change - chestAmt} WHERE clientid = ${msg.author.id}`);

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

      con.query(`SELECT * FROM accounts WHERE uid ="${uuid}"`, function (err, result) {
          Points = result[0].ets_balance
        con.query(`UPDATE accounts SET ets_balance = ${Points + totalReward} WHERE uid = "${uuid}"`);
      });

      //msg.channel.send("Congratz! You won " + totalReward + " Ets. \nLoot boxes: " + crates);

      let Message = "";

      if(intMythic >= 1) {Message = Message + "x" + intMythic  + " Mythic Lootboxes\n"}
      if(intLegendary >= 1) {Message = Message + "x" + intLegendary + " Legendary Lootboxes\n"}
      if(intElite >= 1) { Message = Message + "x" + intElite + " Elite Lootboxes\n"}
      if(intRare >= 1) {Message = Message + "x" + intRare + " Rare Lootboxes\n"}
      if(intUncommon >= 1) {Message = Message + "x" + intUncommon + " Uncommon Lootboxes\n"}
      if(intCommon >= 1) {Message = Message + "x" + intCommon + " Common Lootboxes\n"}


      msg.reply("Congratz! You Won " + totalReward + " Ets. \nLoot Boxes:\n" + Message)

    }
  });
});
}


function UpdateDaily(){
con.query('UPDATE Name SET Daily = Daily - 1 WHERE Daily > 0')
}

// Clear Daily //
function dailyClear(client, con, LogChat) {
  con.query(`SELECT Daily FROM Name`, function (err, result){
    con.query(`UPDATE Name SET Daily = ${0}`);
    client.channels.get(LogChat).send("Cleared daily cooldowns for all players");
  });
}


// Get Level //
function getLevel(msg, con) {
  con.query(`SELECT * FROM Name WHERE clientid ="${msg.author.id}"`, function(err, result){
      Levelint = result[0].Level;
    if (Levelint = 0) return msg.reply("Your current level is 0");
    msg.reply("Your current level is " + Levelint);
  });
}

// Get Daily //
function getDaily(msg, con) {
  con.query(`SELECT * FROM Name WHERE clientid = ${msg.author.id}` , function(err, result){
  uuid = result[0].uuid

  con.query(`SELECT * FROM Name WHERE clientid =${msg.author.id}`, function(err, result) {
    if (result[0].Daily <= 0) {
        ChestInt = result[0].Chest
            con.query(`SELECT * FROM accounts WHERE uid = "${uuid}"`, function(err, result){
                ets_balanceint = result[0].ets_balance
                con.query(`UPDATE accounts SET ets_balance = ${ets_balanceint + 20} WHERE uid = "${uuid}"`);
            })
      con.query(`UPDATE Name SET Chest = ${ChestInt + 1} WHERE clientid = ${msg.author.id}`);
      con.query(`UPDATE Name SET Daily = ${20} WHERE clientid = ${msg.author.id}`);

      msg.reply("You have collected your daily loot");
    } else {
      con.query(`SELECT Daily FROM Name WHERE clientid ="${msg.author.id}"`, function(err, result) {
          DailyWait = result[0].Daily
        msg.reply("You have to wait " + DailyWait +  " hours!");
      });
    }
  });
  });
}



// pay //
function pay(msg, con) {
  con.query(`SELECT * FROM Name WHERE clientid = ${msg.author.id}` , function(err, result){
  uuid = result[0].uuid
  
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

  con.query(`SELECT * FROM accounts WHERE uid ="${uuid}"`, function(err, result) {
    let CurrentPoints = result[0].ets_balance;
    if (CurrentPoints < 0) return msg.reply("sadly you do not have any Ets yet!");
    if (CurrentPoints < sendPoints) return msg.reply("you don't have enough Ets!");
    con.query(`UPDATE accounts SET ets_balance = "${CurrentPoints - sendPoints}" WHERE uid = "${uuid}"`);
    con.query(`SELECT * FROM Name WHERE clientid = "${getPlayer}"`, function(err, result){
      uuidto = result[0].uuid

    con.query(`SELECT * FROM accounts WHERE uid ="${uuidto}"`, function(err, result) {
      points = result[0].ets_balance
      con.query(`UPDATE accounts SET ets_balance = "${points + sendPoints}" WHERE uid = "${uuidto}"`);
      msg.channel.send("You sent " + sendPoints + " Ets to " + inp)
    });
    });
  });
});
}

// Buy Chest //
function buyChest(msg, con) {
  con.query(`SELECT * FROM Name WHERE clientid = ${msg.author.id}` , function(err, result){
  uuid = result[0].uuid
  let args = msg.content.split(" ").slice(1);

  let chestAmt = 0;

  if (typeof args[1] != "string") {
    chestAmt = 1;
  } else {
    chestAmt = parseInt(args[1]);
  }

  if (chestAmt < 1) return msg.reply("You cannot buy chest amounts of 0 or less!");
  let amtPrice = chestAmt * 15;


  con.query(`SELECT * FROM accounts WHERE uid ="${uuid}"`, function(err, result) {
    pointscurrent = result[0].ets_balance
    if (pointscurrent < amtPrice) { return msg.channel.send("You do not have enough Ets!")};

    con.query(`UPDATE accounts SET ets_balance = ${pointscurrent - amtPrice} WHERE uid = "${uuid}"`);

    msg.reply("You purchased " + chestAmt + " chest. At price of " + amtPrice + " Ets");
    con.query(`SELECT * FROM Name WHERE clientid = "${msg.author.id}"`, function(err, result){
      Chests = result[0].Chest
    
    con.query(`UPDATE Name SET Chest = ${Chests + chestAmt} WHERE clientid = "${msg.author.id}"`);
  });
});
});
}

// Clear Bal // 
function clearBal(msg, con) {
  con.query(`SELECT * FROM Name WHERE clientid = ${msg.author.id}` , function(err, result){
  uuid = result[0].uuid
  });
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

  con.query(`SELECT * FROM Name WHERE clientid ="${getPlayer}"`, function(err, result){
    uuidto = result[0].uuid
    con.query(`UPDATE accounts SET ets_balance = ${0} WHERE uid = ${uuidto}`);
    con.query(`UPDATE Name SET Chest = ${0} WHERE clientid = ${getPlayer}`);
    con.query(`UPDATE Name SET Daily = ${0} WHERE clientid = ${getPlayer}`);
    con.query(`UPDATE Name SET Level = ${0} WHERE clientid = ${getPlayer}`);

    msg.channel.send("Successfully cleared the account of " + inp );
  });
}

// Link //
function Link(msg, con) {
  let args = msg.content.split(" ").slice(1);
  let name = args[0]
  MojangAPI.nameToUuid(name, function(err, res) {
    if (err)
        console.log(err);
    else {
        let uuidbytes = uuidParse.parse(res[0].id);
        let uuid = uuidParse.unparse(uuidbytes);
        con.query(``)

    }
});
}

function onStart() {
  setInterval(function() {UpdateDaily()}, 1000 * 60);
}
exports.onStart = onStart;
exports.getLevel = getLevel;
exports.getBal = getBal;
exports.getDaily = getDaily;
exports.pay = pay;

exports.useChest = useChest;
exports.buyChest = buyChest;
exports.balChest = balChest;
exports.UpdateDaily = UpdateDaily;
exports.clearBal = clearBal;
exports.dailyClear = dailyClear;
exports.Link = Link;