const express = require('express');
const router = express.Router();
const User  = require('../models/Users')
const bcrypt     = require("bcryptjs");
const passport = require("passport");
const Post     = require('../models/Posts')
const Group     = require('../models/Groups')
const Event     = require('../models/Events')

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
  let type = req.body.type

  const saltRounds = 10;
  const salt  = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);

  User.create({
    username: username,
    password: hash,
    email: email,
    confirmationCode: token,
    type: type
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
    // Post.find({ authorID: {$in: req.user.friends }})
    Post.find({ $or: [ { authorID: { $in: req.user.friends } }, { authorID: req.user.id}]}).then(data => {
      data.forEach(thing => { 
        thing.iAmAdmin = false;

        if(thing.authorID.equals(req.user.id)){
          thing.iAmAdmin = true;
        }
      })
        res.render('user-views/profile', {posts: data.reverse()})
    }).catch(err => next(err))
})

router.post('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/')
});

router.get('/findfriends', (req,res,next) => {
  User.find({ _id: { $nin: req.user.friends, $ne: req.user.id} }).then(users => {
    console.log
    res.render('user-views/findfriends' , {users: users})
  })
})

router.get('/profile/:id', (req,res,next) => {

  User.findById( req.params.id ).then(data =>
    Post.find({authorID: data.id}).then(posts => {
      res.render('user-views/friend', {user: data, posts: posts.reverse()})
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
  
  //profile changes post will go here
  let userObj = {}
  if (req.file) { userObj.profilePic = req.file.url};
  if (req.body.name) userObj.name = req.body.name;
  if (req.body.bio) userObj.bio = req.body.bio;
  if (req.body.email) userObj.email = req.body.email;
  if (req.body.illness) userObj.illness = req.body.illness

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


router.post('/edit/medications', (req,res,next) => {
  if (req.body.medication) {
    User.findByIdAndUpdate( req.user.id, {$push: {medications: req.body.medication}}).then(
      data => {
        res.redirect('/user/edit')
      })
  }
  else {
    User.findByIdAndUpdate(req.user.id, {$pull: {medications:{ $in: req.body.remove}}}).then(data =>{
      res.redirect('/user/edit')
    })
  }
})

router.post('/edit/conditions', (req,res,next) => {
  if (req.body.illness) {
    User.findByIdAndUpdate( req.user.id, {$push: {illness: req.body.illness}}).then(
      data => {
        res.redirect('/user/edit')
      })
  }
  else {
    User.findByIdAndUpdate(req.user.id, {$pull: {illness:{ $in: req.body.remove}}}).then(
      data =>{
      res.redirect('/user/edit')
    })
  }
})



router.get('/groups', (req,res,next) => {
  Group.find({ members: { $in: req.user.id} }).then(data => {
    res.render('user-views/groups' , {groups: data})
  })
})


router.get('/events', (req,res,next) => {
  console.log(req.user.id)
  Event.find({ members: { $in: req.user.id} }).then(data => {
    console.log(data)
    res.render('user-views/events' , {events: data})
  })
})


router.post('/filterfriends', (req,res,next) => {
  let illnessFilter = req.body.illness
  let medicationFilter = req.body.medication


  if (medicationFilter && illnessFilter) {
    User.find({ $or: [ { medications: { $in: medicationFilter } }, { illness: {$in: illnessFilter}}]}).then(users => {
      res.render('user-views/findfriends' , {users: users})
    })
  }

  if (illnessFilter) {
    User.find({illness: {$in: illnessFilter}}).then(users => {
      console.log(users)
      res.render('user-views/findfriends' , {users: users})
    })
  }

  if (medicationFilter) {
    User.find({medications: {$in: medicationFilter}}).then(users => {
      console.log(users)
      res.render('user-views/findfriends' , {users: users})
    })
  }
})


module.exports = router;


