const express = require('express');
const session = require('express-session');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;

const app = express();
const port = 9000;

// Configure express-session middleware
app.use(session({
    secret: 'steam', // Change this to your own secret key
    resave: false,
    saveUninitialized: true
}));

// Serialization function to save user information into the session
passport.serializeUser((user, done) => {
    done(null, user); // Serialize the entire user object into the session
});

// Deserialization function to retrieve user information from the session
passport.deserializeUser((user, done) => {
    done(null, user); // Deserialize the entire user object from the session
});

// Configure passport with SteamStrategy
passport.use(new SteamStrategy({
    returnURL: 'http://upstreamreact.com:9000/auth/steam/return',
    realm: 'http://upstreamreact.com:9000/',
    apiKey: '07BEB18F79F782CA90CBA4C16DA3DB98'
  },
  function(identifier, profile, done) {
    // Extract the SteamID from the profile object
    const steamId = profile._json.steamid;
    
    // You can also access other information like display name, avatar, etc. from the profile object
    
    // Pass the SteamID to the callback function
    return done(null, steamId);
  }
));

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session()); // Use passport session middleware

// Define the /auth/steam route
app.get('/auth/steam', passport.authenticate('steam'));

// Handle the callback route after Steam authentication
app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  });
  
// Route for the root path
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the Steam OpenID authentication demo!</h1>
    <a href="/auth/steam"><img src="https://community.cloudflare.steamstatic.com/public/images/signinthroughsteam/sits_02.png"/></a>
  `);
});


// Route for successful login
app.get('/profile', (req, res) => {
  const steamId = req.user; // Assuming req.user contains the SteamID
  res.redirect(`http://upstreamreact.com:80/Register?steamId=${steamId}`); // Redirect to register page with Steam ID as query parameter
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

