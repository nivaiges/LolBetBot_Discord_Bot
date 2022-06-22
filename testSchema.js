const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    message:{
        type: Array,
        required: true
    }
})

module.exports = mongoose.model('playerdata', schema);