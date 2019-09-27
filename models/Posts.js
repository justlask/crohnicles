const mongoose  = require('mongoose');
const Schema    = mongoose.Schema

const postSchema = new Schema({
  title: String,
  author: String,
  authorID: { type : Schema.Types.ObjectId, ref: 'User' },
  body: String,
  image: String,
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment"}],
  date: { type: Date, default: Date.now },
  type: { type: String, enum : ["Personal", "Health"]},
  hidden: Boolean,
  meta: { likes: Number },
  timestamps: { type: Boolean,
    default: true
  },
  date: Date,
});


const Post = mongoose.model('Post', postSchema);

module.exports = Post;