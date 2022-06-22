const mongoose = require('mongoose');

const notifyMeSchema = new mongoose.Schema({
    name:{
        type: String,
    }
})

module.exports = mongoose.model('notifyMe', notifyMeSchema);
