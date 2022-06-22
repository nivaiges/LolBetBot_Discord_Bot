const mongoose = require('mongoose');

const betBalanceSchema = new mongoose.Schema({
    message:{
        type: Object,
    }
})

module.exports = mongoose.model('betBalance', betBalanceSchema);