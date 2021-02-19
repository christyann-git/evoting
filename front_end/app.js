const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');


//config socket
var server = require('http').createServer(app),
    io = require('socket.io')(server);

//passport config
require('./config/passport')(passport);

//DB config
const db = require('./config/keys').MongoUIRI;

//Connect to mongo
mongoose.connect(db, { userNewUrlParser: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Bodyparser
app.use(express.urlencoded({ extended: false }));

//Express Session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

//passport
app.use(passport.initialize());
app.use(passport.session());
//app.use(app.router);

//connect flash
app.use(flash());

//Global vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    
    next();
});

//routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/vote', require('./routes/vote'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log('Server started on port 5000'));