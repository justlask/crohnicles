const express = require('express');
const router = express.Router();
const User  = require('../models/Users')
const bcrypt     = require("bcryptjs");
const passport = require("passport");
const Post     = require('../models/Posts')

const uploadCloud = require('../config/cloudinary.js');

router.get("/signup", (req,res,next) => {
  res.render("user-views/signup")
})

router.post('/signup', (req,res,next) => {

  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let token = '';
  for (let i = 0; i < 25; i++) {
    token += characters[Math.floor(Math.random() * characters.length )];
  }

  let username = req.body.username
  let password = req.body.password
  let email = req.body.email

  const saltRounds = 10;
  const salt  = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);

  

  User.create({
    username: username,
    password: hash,
    email: email,
    confirmationCode: token
  }).then(data => {
    res.redirect("/user/login")

  }).catch(err => next(err))
})

router.get("/login", (req,res,next) => {
  res.render("user-views/login")
})

router.post('/login', passport.authenticate("local", {
  successRedirect: "/user/profile",
  failureRedirect: "/user/login",
  failureFlash: true,
  passReqToCallback: true
}));

router.use((req,res,next) => {
  if (!req.user) {
    res.redirect("/user/login");
  }
  next();
}); 


router.get('/profile', (req,res,next) => {
  //get all posts from user and user friends
    Post.find({ authorID: {$in: req.user.friends } })
    .then(data => {
        console.log(data)
        res.render('user-views/profile', {posts: data})

    }).catch(err => next(err))
})

router.post('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/')
});

router.get('/findfriends', (req,res,next) => {
  User.find({ _id: { $nin: [req.user._id, req.user.friends]} }).then(users => {
    res.render('user-views/findfriends' , {users: users})
  })
})

router.get('/profile/:id', (req,res,next) => {

  User.findById( req.params.id ).then(data =>
    Post.find({authorID: data.id}).then(posts => {
      console.log(posts[0].image)
      res.render('user-views/friend', {user: data, posts: posts})
    })
    )
})

router.post('/profile/addfriend', (req,res,next) => {
  User.findByIdAndUpdate(req.user.id,
    {$push: {friends: req.body.friendID}}
  ).then(profile => {
      req.flash('success', 'friend has been added')
      res.redirect('/user/profile')
  })
})


router.get('/friends', (req,res,next) => {
  User.findById(req.user.id).populate('friends').then(data => {
    res.render('user-views/friends', {friends: data.friends})
  })
})

router.get('/edit', (req,res,next) => {
  //edit profile stuff will go here
  res.render('user-views/edit')
})

router.post('/edit', uploadCloud.single('photo'),(req,res,next) => {
  console.log(req.body)
  //profile changes post will go here
  let userObj = {}
  if (req.file) { userObj.profilePic = req.file.url};
  if (req.body.name) userObj.name = req.body.name;
  if (req.body.bio) userObj.bio = req.body.bio;
  if (req.body.email) userObj.email = req.body.email;
  if (req.body.illness) userObj.illness = req.body.illness
  //{$push: {illness: req.body.illness}}
  if (req.body.medication) userObj.medications = req.body.medication;
  //{$push: {medications: req.body.medication}}

  User.findByIdAndUpdate(req.user.id, userObj).then(data => {
    res.redirect('/user/profile')
  }).catch(err => next(err))
});


router.post('/profile/removefriend', (req,res,next) => {
  User.findByIdAndUpdate(req.user.id, 
    { $pull: {friends: req.body.friendID }
  }).then(data => {
    res.redirect("/user/friends")
  }).catch(err => next(err))
});

router.post("/delete", (req,res,next) => {
  User.findByIdAndRemove(req.user.id).then(data => {
    req.logout();
  }).catch(err => next(err))
});


module.exports = router;