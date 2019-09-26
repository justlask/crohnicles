const express = require('express');
const router = express.Router();
const Events  = require('../models/Events')
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
  res.render('event-views/create')
})


router.get('/:id', (req,res,next) => {
  Events.findById(req.params.id).populate('members').populate('admin').then(data => {
    res.render('event-views/viewone', {events: data})
  }).catch(err => next(err))
})




module.exports = router;