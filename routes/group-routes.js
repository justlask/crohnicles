const express = require('express');
const router = express.Router();
const User  = require('../models/Users')
const Group = require('../models/Groups')
const uploadCloud = require('../config/cloudinary.js');


router.use((req,res,next) => {
  if (!req.user) {
    res.redirect("/user/login");
  }
  next();
}); 

router.get('/create', (req, res, next) => {
  res.render('group-views/create')
})


router.post('/create',uploadCloud.single('photo'), (req,res,next) => {
  let newGroup = {
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
  if (req.file) { newGroup.groupImage = req.file.url};
  Group.create(newGroup).then(data => {
    let id = data.id
    res.redirect(`/groups/${id}`)
  })
})


router.get('/:id', (req,res,next) => {

  Group.findById(req.params.id).populate('members').populate('admin').then(data => {

    let iAmAdmin = false;

    if(req.user._id.equals(data.admin._id)){
      iAmAdmin = true;
    }


    // data.admin.isGroupAdmin = true
    res.render('group-views/viewone', {group: data, admin: iAmAdmin})
  }).catch(err => next(err))
})




router.get('/', (req,res,next) => {
  Group.find().populate('admin').populate('members').then(data => {
    res.render('group-views/viewall', {groups: data})
  })
})



router.get('/edit/:id', (req,res,next) => {
  Group.findById(req.params.id).populate('members').populate('admin').then(data => {
    let iAmAdmin = false;

    if(req.user._id.equals(data.admin._id)){
      iAmAdmin = true;
    }
      res.render("group-views/edit", {group: data, admin: iAmAdmin})
  })
})


router.post('/remove/:id/:groupID', (req,res,next) => {
  let memberID = req.params.id
  let groupID = req.params.groupID
  Group.findByIdAndUpdate(groupID, { $pull: { members: memberID }}).then(data => {
    res.redirect(`/groups/${req.params.groupID}`)
  })
})


module.exports = router;