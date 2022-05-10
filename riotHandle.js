const riotApiKey = 'RGAPI-e73ce4fe-6a5b-49ac-95c4-365f3d4d691e';
import axios from 'axios';
const sp = '%20';
const fetch = require('node-fetch');
var searchText ="Nivy";

function searchForPlayer()
{
    // Set up the correct API call
    var APICallString = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/{summonerName}" + searchText + "?api_key=" + riotApiKey;
    // Handle The API call
    axios.get(APICallString).then(function (response) {
    // Success
        console.log(response);
    }).catch(function (error) {
    // Error
    console.log(response);
    });
}


