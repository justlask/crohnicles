const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;

const eventSchema = new Schema({
  name: String,
  groupImage: String,
  admin: {type: Schema.Types.ObjectId, ref: 'User'},
  summary: String,
  members: [ { type : Schema.Types.ObjectId, ref: 'User' } ],
  location: {
    address: {type: String},
    city: {type: String},
    state: {type: String},
    zipcode: {type: String}
  },
})


const Events = mongoose.model("Events", eventSchema)

module.exports = Events;