const express = require('express');
const router = express.Router();
const User  = require('../models/Users')
const Event = require('../models/Events')
const Comment = require('../models/Comments')
const uploadCloud = require('../config/cloudinary.js');


router.use((req,res,next) => {
  if (!req.user) {
    res.redirect("/user/login");
  }
  next();
}); 

router.get('/create', (req, res, next) => {
  res.render('event-views/create')
})


router.post('/create',uploadCloud.single('photo'), (req,res,next) => {
  let newEvent = {
    name: req.body.name,
    summary: req.body.summary,
    location: {
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zipcode: req.body.zipcode,
    },
    admin: req.user.id,
    members: [req.user.id],
  }
  if (req.file) { newEvent.eventImage = req.file.url};
  Event.create(newEvent).then(data => {
    let id = data.id
    res.redirect(`/events/${id}`)
  })
})


router.get('/:id', (req,res,next) => {

  Event.findById(req.params.id).populate('members').populate('admin').populate('comments').then(data => {

    let iAmAdmin = false;

    if(req.user._id.equals(data.admin._id)){
      iAmAdmin = true;
    }

    let isMember = false

    data.members.forEach(member => {
      if (req.user._id.equals(member._id)) {
        isMember = true
      }
    })
    res.render('event-views/viewone', {event: data, admin: iAmAdmin, isMember: isMember})
  }).catch(err => next(err))
})






router.get('/', (req,res,next) => {
  Event.find({ members: { $nin: req.user.id} }).populate('admin').populate('members').then(data => {
    res.render('event-views/viewall', {events: data})
  })
})



router.get('/edit/:id', (req,res,next) => {
  Event.findById(req.params.id).populate('members').populate('admin').then(data => {
    let iAmAdmin = false;

    if(req.user._id.equals(data.admin._id)){
      iAmAdmin = true;
    }
      res.render("event-views/edit", {event: data, admin: iAmAdmin})
  })
})



router.post('/edit/:id', uploadCloud.single('photo'), (req,res,next) => {
  let eventObj = {
    location: {},
  }

  if (req.file) { eventObj.eventImage = req.file.url};
  if (req.body.name) eventObj.name = req.body.name;
  console.log(eventObj)
  if (req.body.address) eventObj.location.address = req.body.address;
  if (req.body.city) eventObj.location.city = req.body.city;
  if(req.body.state) eventObj.location.state = req.body.state;
  if(req.body.zipcode) eventObj.location.zipcode = req.body.zipcode;
  if (req.body.summary) eventObj.summary = req.body.summary;
  Event.findByIdAndUpdate(req.params.id, eventObj).then(

    res.redirect(`/events/${req.params.id}`)
  ).catch(err => next(err))
})


router.post('/remove/:id/:eventID', (req,res,next) => {
  let memberID = req.params.id
  let eventID = req.params.eventID
  Event.findByIdAndUpdate(eventID, { $pull: { members: memberID }}).then(data => {
    res.redirect(`/events/${req.params.eventID}`)
  }).catch(err => next(err))
})




router.post('/join/:id', (req,res,next) => {

  Event.findByIdAndUpdate(req.params.id, {$push: {members: req.user.id}})
  .then(data => {
      res.redirect(`/events/${req.params.id}`)
    }
  )
})




//messing around with adding a "chat" feature to groups
//create a comment in the comment schema
//save comment id to group.comments array
//on group page load, query all comments with that post id
router.post('/comment/:id', (req,res,next) => {

  let newComment = {
    author: req.user.username,
    authorID: req.user.id,
    groupID: req.params.id,
    body: req.body.content,
    date: new Date,
  }
  console.log(newComment)
  Comment.create(newComment).then(data => {
    Event.findByIdAndUpdate( data.groupID, {$push: {comments: data.id}}).then(
      data => {
        res.redirect(`/events/${data.id}`)
      })
  })
})



// res.send(data.groupID, data.id)
module.exports = router;