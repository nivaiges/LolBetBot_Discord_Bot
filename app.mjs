import Discord from "discord.js";
import mongoose from "mongoose";
import testSchema from "./test-schema.js";
import token from "./token.js";
import axios from "axios";
import fs from "fs";
//import 'dotenv/config';
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

const prefix = "%";
//const fetch = require("node-fetch");

var searchText = "";
var summonerID = "";


/*function writeToDataBase(playerData)
{
  new testSchema({
    message: 'writing to database!',
  }).save();
  console.log("I wrote to the database");
}
writeToDataBase();
*/


//token is key found in token.js
client.login(token);


//once client gives a response, it then asks the database for a response
//after both successfully finish, it console's that the bot is logged in
client.on("ready", async () => {
  await mongoose.connect(
    'mongodb+srv://niva:jasper8018@mydatabase.qqmsz.mongodb.net/test',
    {
      keepAlive: true,
    }
    
  )

  console.log(`Logged in as ${client.user.tag}!`);
});

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
    console.log("win");
    searchForPlayer();
  } else if (command == "lose") {
    message.channel.send("You bet that they would lose!");
    console.log("lose");
  } else if (command.includes("betadd")) {
    message.channel.send("You added: " + args + " to bet list!");
    //searchText = args;
    //betAddPlayer(args);
    
    let encodedPlayerName = encodeURI(args); 
    console.log(encodedPlayerName);
    searchForPlayer(encodedPlayerName);
  } else if (command != "lose" && command != "win") {
    message.channel.send(
      command + " is not a valid command \n Please use %win or %lose"
    );
    console.log(command);
  }
});



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
    })
    .catch(function (error) {
      // Error
      console.log("(line 43) Error Caught:  " + error);
    });
}

//purpose of this function is to check whether a user is in game. the data that it returns is not used
//however the error code that it may return will be used to determine if they are in game or not
//if error code 400 is returned, the api call was setup wrong
//if error code 404 is returned, the api call was setup right but the user isn't in-game
//if no error code is returned that means the user is in game and we can then alert the discord channel that someone is in game.


function getSpectatorInfo(event) {
  var SpectatorAPICallString =
    "https://na1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/" + summonerID + "?api_key=" + riotApiKey;

  axios.get(SpectatorAPICallString).then(function (response1) {
    // Success
    console.log(response1.data);
    message.channel.send(response1.data);
  }).catch(function (error1) {
    // Error
    console.log("(57) Error Caught: " + error1);
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



 /*fs.writeFileSync('summoners.txt', player, err => {
    if (err) {
      console.log(error);
      return;
    }

  });*/
  //c:\\Users\\nivai\\first_vs_code\\Discord_Bot\\

 /* fs.readFile('summoners.txt', 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(data);
  });
*/
