const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
    message:{
        type: String,
    }
})

module.exports = mongoose.model('betList', betSchema);