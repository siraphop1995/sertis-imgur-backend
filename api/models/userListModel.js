const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        Required: 'Please enter'
    },
    password: {
        type: String,
        Required: 'Please enter'
    },
    name: {
        type: String,
        Required: 'Please enter'
    },
    email: {
        type: String,
        Required: 'Please enter'
    },
})

module.exports = mongoose.model('Users', UserSchema)