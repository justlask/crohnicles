const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;

const eventSchema = new Schema({
  name: String,
  eventImage: String,
  admin: {type: Schema.Types.ObjectId, ref: 'User'},
  summary: String,
  members: [ { type : Schema.Types.ObjectId, ref: 'User' } ],
  location: {
    address: {type: String},
    city: {type: String},
    state: {type: String},
    zipcode: {type: String}
  },
  comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
  eventDate: {
    month: {type: String},
    day: {type: String},
    year: {type: String}
  }
})


const Events = mongoose.model("Events", eventSchema)

module.exports = Events;