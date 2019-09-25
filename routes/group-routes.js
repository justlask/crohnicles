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
    console.log(data)
    let id = data.id
    res.redirect(`/groups/${id}`)
  })
})


router.get('/:id', (req,res,next) => {

  Group.findById(req.params.id).populate('members').populate('admin').then(data => {
    res.render('group-views/viewone', {group: data})
  }).catch(err => next(err))
})




router.get('/', (req,res,next) => {
  Group.find().populate('admin').populate('members').then(data => {
    res.render('group-views/viewall', {groups: data})
  })
})


module.exports = router;