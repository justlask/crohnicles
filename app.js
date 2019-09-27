require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');

const bcrypt       = require('bcryptjs');

const flash        = require('connect-flash');
const session    = require("express-session");
const MongoStore = require("connect-mongo")(session);

const passport     = require('passport');
const LocalStrategy     = require('passport-local').Strategy
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User          = require('./models/Users')

mongoose
  .connect(process.env.MONGO_URI, {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));



// default value for title local
app.locals.title = 'Crohnicle';

app.use(session({
  secret: "our-passport-local-strategy-app",
  resave: true,
  saveUninitialized: true
}));



passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

passport.use(new LocalStrategy((username, password, next) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, { message: "Incorrect username" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: "Incorrect password" });
    }

    return next(null, user);
  });
}));


// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GID,
//       clientSecret: process.env.GSECRET,
//       callbackURL: "/auth/google/callback"
//     },
//     (accessToken, refreshToken, profile, done) => {
//       // to see the structure of the data in received response:
//       console.log("Google account details:", profile);

//       User.findOne({ googleID: profile.id })
//         .then(user => {
//           if (user) {
//             done(null, user);
//             return;
//           }

//           User.create({ 
//             googleID: profile.id,
//             username: profile._json.name,
//             email: profile._json.email,
//             isAdmin: false
//            })
//             .then(newUser => {
//               done(null, newUser);
//             })
//             .catch(err => done(err)); // closes User.create()
//         })
//         .catch(err => done(err)); // closes User.findOne()
//     }
//   )
// );


app.use(passport.initialize());
app.use(passport.session());

app.use(flash());


app.use((req, res, next) => {
  res.locals.user = req.user
  res.locals.errorMessage = req.flash('error')
  next();
})




const index = require('./routes/index');
app.use('/', index);


app.use('/user', require('./routes/user-routes'))

app.use('/post', require('./routes/post-routes'))

app.use('/groups', require('./routes/group-routes'));

app.use('/events', require('./routes/event-routes'))




module.exports = app;