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



module.exports = router;