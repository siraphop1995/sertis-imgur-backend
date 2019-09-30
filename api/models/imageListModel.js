const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ImageSchema = new Schema({
    imageName: {
        type: String
    },
    description: {
        type: String
    },
    userId: {
        type: String
    },
    url: {
        type: String
    },
    gcloudObject: {
        type: String
    }
})

module.exports = mongoose.model('Images', ImageSchema)