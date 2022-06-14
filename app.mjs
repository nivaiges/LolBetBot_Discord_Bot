import Discord from "discord.js";
import mongoose from "mongoose";
import testSchema from "./testSchema.js";
import betSchema from "./betListSchema.js";
import betBalanceSchema from "./userBalanceSchema.js";
import token from "./token.js";
import axios from "axios";
import riotApiKey from "./riotApi.js";
import betListSchema from "./betListSchema.js";
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const prefix = "%";
var searchText = "";
var summonerID = "";
let channelID = "985533385139183626";
let playerBets = new Map();
let playerHashMap = new Map();
const uri = "";
let playerListSchema;
//once client gives a response, it then asks the database for a response
//after both successfully finish, it console's that the bot is logged in
client.login(token);
client.on("ready", async () => {
  await mongoose.connect(uri, {
    keepAlive: true,
  });

  console.log(`Logged in as ${client.user.tag}!`);
});
//command handler/intake.
// %win
// %lose
// %anything_else --> will not execute anything outside of the statement
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  console.log(command);

  if (command == "win") {
    let iterator1 = playerBets.keys();
    let holdIterator;
    let skipPlayerBetSet = 0;
    //if the player is In-game
    //if the playerBet map already contains their discord username
    if (playerHashMap.has(args[0])) {
      for (let i = 0; i < playerBets.size; i++) {
        holdIterator = iterator1.next().value;
        if (
          holdIterator.discordID == message.author.username &&
          holdIterator.summonerName == args[0]
        ) {
          message.channel.send("You already voted!");
          skipPlayerBetSet = 1;
        }
      }
      if (skipPlayerBetSet == 0) {
        playerBets.set(
          new betInstance(args, message.author.username, "win"),
          message.author.username
        );
        message.channel.send(
          message.author.username + " bet " + args + " would win!"
        );
      }
    } else {
      message.channel.send(
        "That Player isn't in game or isn't on the betlist."
      );
    }
    // console.log(trackPlayerBetMap.get());
    //trackPlayerBetMap.set(message.author.username, "win")
  } else if (command === "lose") {
    let iterator1 = playerBets.keys();
    let holdIterator;
    let skipPlayerBetSet = 0;
    //if the player is In-game
    //if the playerBet map already contains their discord username
    if (playerHashMap.has(args[0])) {
      for (let i = 0; i < playerBets.size; i++) {
        holdIterator = iterator1.next().value;
        if (
          holdIterator.discordID == message.author.username &&
          holdIterator.summonerName == args[0]
        ) {
          message.channel.send("You already voted!");
          skipPlayerBetSet = 1;
        }
      }
      if (skipPlayerBetSet == 0) {
        playerBets.set(
          new betInstance(args, message.author.username, "lose"),
          message.author.username
        );
        message.channel.send(
          message.author.username + " bet " + args + " would lose!"
        );
      }
    } else {
      message.channel.send(
        "That Player isn't in game or isn't on the betlist."
      );
    }
  } else if (command == "credits") {
    message.channel.send(
      "**Main Author:**\n<https://github.com/nivaiges>\n**Contributers:**\n<https://github.com/marcobuettner>\n<https://github.com/Jacobwill2501>\n<https://darkintaqt.com/>\n**Artists:**\n<https://twitter.com/diazex_art>\n" +
      "*LoLBetBot isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties." +
        " Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.*"
    );
    channelID = message.channel.id;
  } else if (command.includes("betadd")) {
    let encodedPlayerName = encodeURI(args);
    searchForPlayer(encodedPlayerName);
  } else if (command == "balance") {
    checkBalance(message.author.username);
  } else if (command == "help") {
    message.channel.send(
"**__LoLBetBot commands:__**\n\n**%betadd [*summoner*]** - adds specified summoner to be bet on.\n\n**%win [*summoner*]** - bet that the specified summoner will win their game.\n\n**%lose [*summoner*]** - bet that the specified summoner will lose their game.\n\n**%balance** - displays user balance.\n\n**%credits** - displays bot authors and contributers.\n\n**%help** - where you are right now."
    );
  }else if(command == "warn" && message.author.username == "nivy")
  {
    message.channel.send("@"+args + " you have been warned.")
  } else if(command == "betlist")
  {
    playerListSchema = await betSchema.findOne({"message": args});
    if(playerListSchema!=null)
    {
      message.channel.send(args[0] + " is on the betList")
    }else{
      message.channel.send(args[0] + " is on the betList")
    }
  }
  else if (
    command != "lose" &&
    command != "win" &&
    command != "credits" &&
    command != "balance" &&
    command != "help" &&
    command!= "warn" &&
    command!= "betlist"
  ) {
    message.channel.send(
      command + " is not a valid command \nPlease use %win or %lose"
    );
  }
  console.log(command + "" + args);
});

class Player {
  constructor(discordName, betWins, betLosses, balance) {
    this.discordName = discordName;
    this.betWins = betWins;
    this.betLosses = betLosses;
    this.balance = balance;
  }
}

class betInstance {
  constructor(summonerName, discordID, choice) {
    this.summonerName = summonerName;
    this.discordID = discordID;
    this.choice = choice;
  }
}

//Takes user input (which is the name of a summoner. example: "Nivy")
//uses [na1.api.riotgames.com] infront of the link to be used for searching a specific region
//add ?api_key + [riotAPIKey] as a passcode of sorts for accessing riot api



async function searchForPlayer(playerName) {
  // Set up the correct API call
  let playerDBSearch = await betSchema.findOne({ message: playerName });
  let decodedName = decodeURI(playerName);
  if (playerDBSearch == null) {
    searchText = playerName;
    var APICallString =
      "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" +
      searchText +
      "?api_key=" +
      riotApiKey;
    // Handle The API call
    axios
      .get(APICallString)
      .then(function (response) {
        // Success
        betAddPlayer(response.data);
        new betSchema({
          message: searchText.toLowerCase(),
        }).save();
      })
      .catch(function (error) {
        // Error
        console.log("Error Caught in searchForPlayer:  " + error);
        client.channels.cache
          .get(channelID)
          .send(decodedName + " is not a real summoner name.");
      });
    client.channels.cache.get(channelID).send("You added: " + decodedName + " to bet list!");
  } else {
    client.channels.cache
      .get(channelID)
      .send(decodedName + " is already on the best list.");
  }
}

//purpose of this function is to check whether a user is in game. the data that it returns is not used
//however the error code that it may return will be used to determine if they are in game or not
//if error code 400 is returned, the api call was setup wrong
//if error code 404 is returned, the api call was setup right but the user isn't in-game
//if no error code is returned that means the user is in game and we can then alert the discord channel that someone is in game.

async function getSpectatorInfo(playerNameForSpectate) {
  summonerID = await mongoFetchPlayerData(playerNameForSpectate);
  var SpectatorAPICallString =
    "https://na1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/" +
    summonerID +
    "?api_key=" +
    riotApiKey;
  let playerStringData = "";
  //console.log(SpectatorAPICallString);
  //make a key map here that matches playerNameForSpectate and whether they are in game or not
  //match with boolean probably
  //could match with 3 things if thats possible playerNameForSpectate boolean and matchID but the function will be called
  //enough to figure out if theyre in game or not
  //  console.log(SpectatorAPICallString);
  axios
    .get(SpectatorAPICallString)
    .then(function (response1) {
      /*
      ======================
      Success
      ======================
      */
      playerStringData = JSON.stringify(response1.data);
      if (playerHashMap.get(playerNameForSpectate) === undefined) {
        playerHashMap.set(
          playerNameForSpectate,
          playerStringData.substring(10, 20)
        );
        client.channels.cache
          .get(channelID)
          .send(
            "\nType %win " +
              playerNameForSpectate +
              " to bet that they'll win   :green_square: \n\nType %lose " +
              playerNameForSpectate +
              " to bet that they'll lose :red_square: "
          );
      }
      //

      //check to see if the playerName used in the current Spec function is found within the playerArrSpectate array
      //this forloop is used to check to see if this is the first instance of the player being in game
      //if they are found within the array then a newBetInstance wont be created
      //after the forloop finds nothing then the player is pushed into the Array
    })
    .catch(function (error1) {
      // Error
      //404 error is acceptable here, it means they are not in game
      //this if statement is used to see if someone has recently finished their game
      //we know this because if people in Game is greater than 0 that means someone was in a match
      //but the function hasn't recognized they are outside
      //i need to match a key map for this
      if (error1 != undefined) {
        error1 = JSON.stringify(error1).substring(44, 47);
      }

      if (error1 === "404" && playerHashMap.has(playerNameForSpectate)) {
        try {
          getMatchData(
            playerNameForSpectate,
            playerHashMap.get(playerNameForSpectate)
          );
        } catch (err) {
          console.log("fatal api error, bet canceled");
        }
        playerHashMap.delete(playerNameForSpectate);
      }

      if (error1 != "404") {
        console.log("Error Caught in getSpectatorInfo: " + error1);
      }
    });
}

function betAddPlayer(player) {
  player = JSON.stringify(player);
  var playerArray = player.split(",");
  console.log(playerArray[3]);
  playerArray[3] = playerArray[3].toString().toLowerCase();
  console.log(playerArray[3]);
  new testSchema({
    message: playerArray,
  }).save();
  console.log("Player was inserted into the database");
}

async function mongoFetchPlayerData(playerNameToFetch) {
  try {
    let newFetchUser = playerNameToFetch;
    // console.log(newFetchUser);
    let fetchedData = await testSchema.findOne({
      message: { $regex: newFetchUser },
    });
    let splitFetchedData = JSON.stringify(fetchedData);
    splitFetchedData = splitFetchedData.split(",");
    for (var i = 0; i < splitFetchedData.length; i++) {
      splitFetchedData[i] = splitFetchedData[i].replace(
        /[&\/\\#+()$~\[\]%,.'":*?<>{}]/g,
        ""
      );
    }
    splitFetchedData[0] = splitFetchedData[0].substring(
      2,
      splitFetchedData[0].length
    );
    splitFetchedData[1] = splitFetchedData[1].substring(
      9,
      splitFetchedData[1].length
    );
    splitFetchedData[2] = splitFetchedData[2].substring(
      9,
      splitFetchedData[2].length
    );
    splitFetchedData[3] = splitFetchedData[3].substring(
      5,
      splitFetchedData[3].length
    );
    splitFetchedData[4] = splitFetchedData[4].substring(
      4,
      splitFetchedData[4].length
    );
    splitFetchedData[5] = splitFetchedData[5].substring(
      13,
      splitFetchedData[5].length
    );
    splitFetchedData[6] = splitFetchedData[6].substring(
      12,
      splitFetchedData[6].length
    );
    splitFetchedData[7] = splitFetchedData[7].substring(
      13,
      splitFetchedData[7].length
    );
    //splitFetchedData.splice(8, 8);
    return splitFetchedData[1];
  } catch (e) {
    console.log(e.message);
  }
}

//access file in mongo database -check
//file contains a list of people that need to be checked if in game -
//seperate name from other non-essential data
//put name in array to iterate through
//run function to get playerID
//use playerID to check if in game
//if they are in game then alert the chat

async function playerListInGameChecker() {
  let playerListJSON = await betSchema.find({}, { _id: false, __v: false });
  let playerListString = JSON.stringify(playerListJSON);
  playerListString = playerListString.replace(
    /[&\/\\#+()$~\[\].'":*?<>{}]/g,
    ""
  );
  ///[^a-zA-Z0-9 ]/g
  let playerListStringArraySplit = playerListString.split(",");

  for (let i = 0; i < playerListStringArraySplit.length; i++) {
    playerListStringArraySplit[i] = playerListStringArraySplit[i].substring(
      7,
      playerListStringArraySplit[i].length
    );

    await getSpectatorInfo(decodeURI(playerListStringArraySplit[i]));
  }
}

const repeatCheckInGame = setInterval(playerListInGameChecker, 15000);

//create new function when get into game
//use call this function when spectate function is called & finds that someone is in game
//keep track of that game until it ends
// we can probably use set interval and the match ID to keep track of the match

//await getMatchData("kalionex", 4341154066);

async function getMatchData(playerNameForMatchData, gameID) {
  let matchDataCallString =
    "https://americas.api.riotgames.com/lol/match/v5/matches/NA1_" +
    gameID +
    "?api_key=" +
    riotApiKey;
  console.log(gameID);
  //console.log(matchDataCallString);
  let matchResult = "";
  //let matchDataToString = "";
  axios
    .get(matchDataCallString)
    .then(function (response) {
      let participants = response.data.info.participants;
      console.log(playerNameForMatchData);
      for (let i = 0; participants.length > i; i++) {
        if (
          participants[i].summonerName.toLowerCase() == playerNameForMatchData
        ) {
          matchResult = participants[i].win;
        }
      }
      //win = true
      //lose = false
      //client.channels.cache.get(channelID).send("Match Over.");
      determineWinOrLose(matchResult, playerNameForMatchData);
      playerHashMap.delete(playerNameForMatchData);
      console.log(
        "playerHashMap.get: " + playerHashMap.get(playerNameForMatchData)
      );
    })
    .catch(function (error) {
      console.log("Error in getMatchData " + error);
    });
}

//probably going to have to have the matchID as a parameter

/*const currPlayers = await betBalanceSchema.findOne({ "message.discordName": "mich"},{ _id: false, __v: false });
if(currPlayers == null)
{
  console.log(currPlayers);
}
console.log(currPlayers);*/

async function findPerson(key, value, winOrLose, playerFromWinorLose) {
  const currPlayers = await betBalanceSchema.findOne(
    { "message.discordName": playerDBName },
    { _id: false, __v: false }
  );
  //fix this
  //also have to parse the arrays
  //they are currently strings
  if (currPlayers === null) {
    new betBalanceSchema({
      message: new Player(key, 0, 0, 0),
    }).save();
  }

  //fix this

  console.log(currPlayers);
  let playerBetString = JSON.stringify(currPlayers);
  playerBetString = playerBetString.replace(
    /[&\/\\#+()$~\[\]%.'":*?<>{}]/g,
    ""
  );
  ///[^a-zA-Z0-9 ]/g
  let playerListStringArraySplit = playerBetString.split(",");
  console.log(playerBetString);
  playerListStringArraySplit[0] = playerListStringArraySplit[0].substring(18);
  playerListStringArraySplit[1] = parseInt(
    playerListStringArraySplit[1].substring(7)
  );
  playerListStringArraySplit[2] = parseInt(
    playerListStringArraySplit[2].substring(9)
  );
  playerListStringArraySplit[3] = parseInt(
    playerListStringArraySplit[3].substring(7)
  );

  console.log(playerListStringArraySplit);

  if (winOrLose == 1 && playerBets.get(key).choice == "true") {
    await betBalanceSchema.deleteOne({ discordName: playerDBName });
    new betBalanceSchema({
      message: new Player(
        playerDBName,
        playerListStringArraySplit[1] + 1,
        playerListStringArraySplit[2],
        playerListStringArraySplit[3] + 100
      ),
    }).save();
    console.log("win, right");
    client.channels.cache
      .get(channelID)
      .send(
        key +
          " was right! \n" +
          key +
          " has a new balance of  " +
          playerListStringArraySplit[3] +
          100
      );
    client.channels.cache.get(channelID).send;
  } else if (winOrLose == 2 && playerBets.get(key).choice == "false") {
    betBalanceSchema.deleteOne({ discordName: playerDBName });
    new betBalanceSchema({
      message: new Player(
        playerDBName,
        playerListStringArraySplit[1] - 1,
        playerListStringArraySplit[2],
        playerListStringArraySplit[3] + 100
      ),
    }).save();
    console.log("lose, right");
    client.channels.cache
      .get(channelID)
      .send(
        key +
          " was right! \n" +
          key +
          " has a new balance of " +
          playerListStringArraySplit[3] +
          100
      );
  } else {
    betBalanceSchema.deleteOne({ discordName: playerDBName });
    new betBalanceSchema({
      message: new Player(
        playerDBName,
        playerListStringArraySplit[1],
        playerListStringArraySplit[2] + 1,
        playerListStringArraySplit[3] - 100
      ),
    }).save();
    client.channels.cache
      .get(channelID)
      .send(
        key +
          " was wrong! \n" +
          key +
          " has a new balance of " +
          playerListStringArraySplit[3] -
          100
      );
  }

  if (playerBets.get(key).summonerName === playerFromWinorLose) {
    playerBets.delete(playerBets.get());
  }
}

//findPerson("nivy", 1);

/*
  if (outcome) {
    //win
    client.channels.cache.get(channelID).send(key + "key was right!");
    playerBets.forEach(findPerson(key, value, 1));
  } else if (!outcome) {
    //lose
    playerBets.forEach(findPerson(key, value, 2));
  } else if (outcome === undefined) {
    client.channels.cache.get(channelID).send("Fatal bet or API error. Bet canceled");
  }
*/

//===================

//playerBets(discordName, betInstance(message.author.username, "lose", args)
/*
playerBets.set(new betInstance("mich", "nivy", "win"), "nivy");
playerBets.set(new betInstance("jacob", "TJ", "lose"), "TJ");
playerBets.set(new betInstance("mich", "naweed", "lose"), "naweed");
*/

async function determineWinOrLose(outcome, summonerFromMatchData) {
  console.log("outcome:" + outcome);
  if (outcome == "true") {
    outcome = "win";
  } else if (outcome == "false") {
    outcome = "lose";
  }

  const iterator1 = playerBets.keys();
  let currValue;
  console.log("playerbet Size: " + playerBets.size);
  for (let i = 0; i < playerBets.size; i++) {
    currValue = iterator1.next().value;
    if (currValue.summonerName === summonerFromMatchData) {
      if (currValue.choice === "win" && outcome === "win") {
        distributeReward(currValue.discordID, "correct");
        //client.channels.cache.get(channelID).send(currValue.discordID + " was correct!")
        console.log(
          currValue.discordID + " " + currValue.summonerName + " correct win 1"
        );
      } else if (currValue.choice === "lose" && outcome === "lose") {
        distributeReward(currValue.discordID, "correct");
        // client.channels.cache.get(channelID).send(currValue.discordID + " was correct!")
        console.log(
          currValue.discordID + " " + currValue.summonerName + " correct loss"
        );
      } else {
        distributeReward(currValue.discordID, "wrong");
        console.log(
          currValue.discordID + " " + currValue.summonerName + " wrong"
        );
        // client.channels.cache.get(channelID).send(currValue.discordID + " was wrong!")
      }
    }
  }
  // client.channels.cache.get(channelID).send("Bet over");
  /*playerHashMap.remove(playerFromMatchData);
  betBalanceSchema.find({key}, { _id: false, __v: false });
  betBalanceSchema.find({key}, { _id: false, __v: false })
  if matchID parsed data == win
  channel.message.send(playerName + " has won their match!");
  else if matchID parsed data == lose
  channel.message.send(playerName + " has lost their match!");
  else if matchID parsed data == remake
  channel.message.send(playerName + " has remaked their match!");
  bonus feature is to record and store coins within mongoDB
  */
}

//map key and value

async function distributeReward(person, rightOrWrong) {
  let currPlayers = await betBalanceSchema.findOne(
    { "message.discordName": person },
    { _id: false, __v: false }
  );
  //fix this
  //also have to parse the arrays
  //they are currently strings
  console.log(currPlayers);
  if (currPlayers === null) {
    new betBalanceSchema({
      message: new Player(key, 0, 0, 20000),
    }).save();
  }

  if (rightOrWrong === "correct") {
    await betBalanceSchema.findOneAndUpdate(
      { "message.discordName": person },
      { $inc: { "message.balance": +1000, "message.betWins": +1 } }
    );
    let currPlayers1 = await betBalanceSchema.findOne(
      { "message.discordName": person },
      { _id: false, __v: false }
    );
    console.log(currPlayers1);
  } else if (rightOrWrong === "wrong") {
    await betBalanceSchema.findOneAndUpdate(
      { "message.discordName": person },
      { $inc: { "message.balance": -1000, "message.betLosses": +1 } }
    );
  }
}

async function checkBalance(discordUser) {
  let discordUsers = await betBalanceSchema.findOne(
    { "message.discordName": discordUser },
    { _id: false, __v: false }
  );
  if (discordUsers === null) {
    client.channels.cache.get(channelID).send("You don't have a balance, creating one for you now.");
    await new betBalanceSchema({
      message: new Player(discordUser, 0, 0, 20000),
    }).save();
  } else {
    client.channels.cache
      .get(channelID)
      .send(
        "Name: " +
          discordUsers.message.discordName +
          "\n" +
          "Correct Bet Guesses: " +
          discordUsers.message.betWins +
          "\n" +
          "Incorrect Bet Guesses: " +
          discordUsers.message.betLosses +
          "\n" +
          "Balance: " +
          discordUsers.message.balance
      );
    if (discordUsers.message.balance <= 0) {
      client.channels.cache.get(channelID).send("broke ass");
    }
  }
}
