const express = require('express');
const router = express.Router();
const User  = require('../models/Users')
const Post  = require('../models/Posts')
const uploadCloud = require('../config/cloudinary.js');



router.use((req,res,next) => {
  if (!req.user) {
    res.redirect("/user/login");
  }
  next();
}); 



router.post('/create',uploadCloud.single('photo'), (req,res,next) => {
  let postObj = {}

  postObj.author = req.user.username,
  postObj.authorID= req.user.id,
  postObj.date= new Date,
  postObj.timestamps= true,
  postObj.body = req.body.content

  if (req.body.title) postObj.title = req.body.title
  if (req.file)  postObj.image = req.file.url;

  Post.create(postObj).then(data => {
    res.redirect('/user/profile')
  }).catch(err => next(err))
})


router.post('/delete/:id', (req,res,next) => {

  Post.findByIdAndDelete(req.params.id).then( data => {
    res.redirect('/user/profile')
  })
})


router.get('/edit/:id', (req,res,next) => {
  Post.findById(req.params.id).then(data => {
    let isAuthor = false;

    if(data.authorID.equals(req.user.id)){
      isAuthor = true;
      res.render("post-views/edit", {posts: data, isAuthor: isAuthor})
    }
    else {
      res.redirect('/user/profile')
    }
  })
});


router.post('/edit/:id', uploadCloud.single('photo'), (req,res,next) => {

  let postObj = {}
  if (req.file) { postObj.image = req.file.url};
  if (req.body.title) postObj.title = req.body.title;
  if (req.body.content) postObj.body = req.body.content;


  Post.findByIdAndUpdate(req.params.id, postObj).then(
    data => {
      console.log(data)
      res.redirect(`/user/profile`)
    }
  )

})


router.get('/single/:id', (req,res,next) => {

  Post.findById(req.params.id).then(data => {
    console.log(data)
    res.render('post-views/view', {posts: data})
  })
})








module.exports = router;