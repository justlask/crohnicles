const mongoose  = require('mongoose');
const Schema    = mongoose.Schema

const postSchema = new Schema({
  title: String,
  author: { type : Schema.Types.ObjectId, ref: 'User' },
  body: String,
  image: String,
  comments: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now },
  type: { type: String,
    enum : ["Personal", "Health"],
    default: "Personal"
  },
  hidden: Boolean,
  meta: { likes: Number },
  timestamps: { type: Boolean,
    default: true
  },
});


const Post = mongoose.model('Post', postSchema);

module.exports = Post;