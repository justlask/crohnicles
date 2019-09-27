const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  image: String,
  friends: [ { type : Schema.Types.ObjectId, ref: 'User' } ],
  bio: String,
  illness: [ {type: String} ],
  medications: [ String ],
  status: { type: String,
    enum : ["Pending Confirmation", "Active"],
    default: "Pending Confirmation"
},
  confirmationCode: String,
  profilePic: String,
  type: {type: String, enum: ["crohnie", "ally", "caregiver", "professional"]},
})

const User = mongoose.model("User", userSchema)

module.exports = User;