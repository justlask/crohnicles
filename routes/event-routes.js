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


router.get('/', (req,res,next) => {
  res.render('event-views/viewall')
})

router.get('/create', (req, res, next) => {
  res.render('group-views/create')
})


router.get('/:id', (req,res,next) => {

  Group.findById(req.params.id).populate('members').populate('admin').then(data => {
    res.render('group-views/viewone', {group: data})
  }).catch(err => next(err))
})




module.exports = router;