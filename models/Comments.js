const mongoose  = require('mongoose');
const Schema    = mongoose.Schema

const commentSchema = new Schema({
  author: String,
  authorID: { type : Schema.Types.ObjectId, ref: 'User' },
  groupID: {type: Schema.Types.ObjectId, ref: 'Groups'},
  body: String,
  meta: { likes: Number },
  timestamps: { type: Boolean,
    default: true
  },
  date: Date,
});


const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;