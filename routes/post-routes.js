const express = require('express');
const router = express.Router();
const User  = require('../models/Users')
const Post  = require('../models/Posts')
const uploadCloud = require('../config/cloudinary.js');



router.post('/create',uploadCloud.single('photo'), (req,res,next) => {
  let postObj = {}

  postObj.author = req.user.username,
  postObj.authorID= req.user.id,
  postObj.date= new Date,
  postObj.timestamps= true,
  postObj.body = req.body.content

  console.log(req.body.content)
  console.log(req.body)
  console.log(req.body.title)

  if (req.body.title) postObj.title = req.body.title
  if (req.file)  postObj.image = req.file.url;

  Post.create(postObj).then(data => {
    res.redirect('/user/profile')
  }).catch(err => next(err))
})







module.exports = router;