import Discord from "discord.js";
import mongoose from "mongoose";
import testSchema from "./testSchema.js";
import betSchema from "./betListSchema.js";
import token from "./token.js";
import axios from "axios";
import riotApiKey from "./riotApi.js";
import testData from "./newDataFormat.js"
import fs from "fs";
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const prefix = "%";
var searchText = "";
var summonerID = "";

//once client gives a response, it then asks the database for a response
//after both successfully finish, it console's that the bot is logged in
client.login(token);
client.on("ready", async () => {
  await mongoose.connect(
   
    {
      keepAlive: true,
    }
  );

  console.log(`Logged in as ${client.user.tag}!`);
});




//const fetchedTestData = 

//command handler/intake.
// %win
// %lose
// %anything_else --> will not execute anything outside of the statement
client.on("messageCreate", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command == "win") {
    message.channel.send("You bet that they would win!");
    mongoFetchPlayerData();
    console.log("win");
  } else if (command == "lose") {
    message.channel.send("You bet that they would lose!");
    console.log("lose");
  } else if (command.includes("betadd")) {
    message.channel.send("You added: " + args + " to bet list!");
    let encodedPlayerName = encodeURI(args);
    searchForPlayer(encodedPlayerName);
  } else if (command != "lose" && command != "win") {
    message.channel.send(
      command + " is not a valid command \n Please use %win or %lose"
    );
  }
});


/*

  function sendChatNotification(playerNameInput)
  {
    message.channel.send(playerNameInput + " just got into game! \n Use %win [amount] or %lose [amount].");
  }
*/
//Takes user input (which is the name of a summoner. example: "Nivy")
//uses [na1.api.riotgames.com] infront of the link to be used for searching a specific region
//add ?api_key + [riotAPIKey] as a passcode of sorts for accessing riot api

function searchForPlayer(playerName) {
  // Set up the correct API call
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
      console.log(response.data);
      betAddPlayer(response.data);
      new betSchema({
        message: searchText,
      }).save();
    })
    .catch(function (error) {
      // Error
      console.log("Error Caught in searchForPlayer:  " + error);
    });
}

//purpose of this function is to check whether a user is in game. the data that it returns is not used
//however the error code that it may return will be used to determine if they are in game or not
//if error code 400 is returned, the api call was setup wrong
//if error code 404 is returned, the api call was setup right but the user isn't in-game
//if no error code is returned that means the user is in game and we can then alert the discord channel that someone is in game.

async function getSpectatorInfo(playerNameForSpectate) {
  summonerID =  await mongoFetchPlayerData(playerNameForSpectate);
  console.log(summonerID);
  var SpectatorAPICallString =
    "https://na1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/" +
    summonerID +
    "?api_key=" +
    riotApiKey;
//console.log(SpectatorAPICallString);
  axios
    .get(SpectatorAPICallString)
    .then(function (response1) {
      // Success
      console.log(response1.data);
      message.channel.send(response1.data);
    })
    .catch(function (error1) {
      // Error
      //404 error is acceptable here, it means they are not in game
      error1 = JSON.stringify(error1).substring(44,47);
      console.log("Error Caught in getSpectatorInfo: " + error1);
    });
}

function betAddPlayer(player) {
  player = JSON.stringify(player);
  var playerArray = player.split(",");
  new testSchema({
    message: playerArray,
  }).save();

  console.log("I wrote to the database");
  console.log("Reading Data" + player);
}

async function mongoFetchPlayerData(playerNameToFetch) {
  try {
    let newFetchUser = playerNameToFetch;
    console.log(newFetchUser);
    let fetchedData = await testSchema.findOne({"message" : {$regex : newFetchUser}});
    let splitFetchedData = JSON.stringify(fetchedData);
    splitFetchedData = splitFetchedData.split(",");
    for (var i = 0; i < splitFetchedData.length; i++) {
      splitFetchedData[i] = splitFetchedData[i].replace(/[&\/\\#+()$~\[\]%,.'":*?<>{}]/g,"");
    }
    splitFetchedData[0] = splitFetchedData[0].substring(2,splitFetchedData[0].length);
    splitFetchedData[1] = splitFetchedData[1].substring(9,splitFetchedData[1].length);
    splitFetchedData[2] = splitFetchedData[2].substring(9,splitFetchedData[2].length);
    splitFetchedData[3] = splitFetchedData[3].substring(5,splitFetchedData[3].length);
    splitFetchedData[4] = splitFetchedData[4].substring(4,splitFetchedData[4].length);
    splitFetchedData[5] = splitFetchedData[5].substring(13,splitFetchedData[5].length);
    splitFetchedData[6] = splitFetchedData[6].substring(12,splitFetchedData[6].length);
    splitFetchedData[7] = splitFetchedData[7].substring(13,splitFetchedData[7].length);
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
  const playerListJSON = await betSchema.find({}, { _id: false, __v: false });
  let playerListString = JSON.stringify(playerListJSON);
  playerListString = playerListString.replace(/[&\/\\#+()$~\[\]%.'":*?<>{}]/g,"");
  ///[^a-zA-Z0-9 ]/g
  let playerListStringArraySplit = playerListString.split(",");

  for (let i = 0; i < playerListStringArraySplit.length; i++) {
    playerListStringArraySplit[i] = playerListStringArraySplit[i].substring(7,playerListStringArraySplit[i].length);
    await getSpectatorInfo(playerListStringArraySplit[i]);
  }
}

const repeatCheckInGame = setInterval(playerListInGameChecker, 5000);


function newBetInstance()
{

}




