// Required DATA

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
// const res = require("express/lib/response");
const cookieSession = require("cookie-session");
const { generateRandomString, searchUserByEmail } = require("./helpers");
// const req = require("express/lib/request");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ name: "session", keys: ["hello", "world"] }));


const urlsForUser = function (id) {
  const results = {};
  const keys = Object.keys(urlDatabase);
  for (const shortUrl of keys) {
    const url = urlDatabase[shortUrl];
    if (url.userId === id) {
      results[shortUrl] = url;
    }
  }
  return results;
};

const urlDatabase = { // database object for storing information to shortUrl
  b2xVn2: {
    longUrl: "http://www.lighthouselabs.ca",
    userId: "grrIQ",
  },
  "9sm5xK": {
    longUrl: "http://www.google.com",
    userId: "grrIQ",
  },
};

const users = { // user object
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// GET Routes 

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls", (req, res) => { // check that user has cookie permissions to see urls
  const userId = req.session.userId;
  const urls = urlsForUser(userId);
  const templateVars = { urls, user: users[userId] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => { // show url database for user
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.userId],
  };
  const user = users[req.session.userId];
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:shortURL", (req, res) => { // 
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longUrl,
    user: users[req.session.userId]
  };
  const user = users[req.session.userId]
  const shortUrl = req.params.shortURL
  console.log(urlDatabase[shortUrl].userId, user);
  if (user && urlDatabase[shortUrl].userId === user.id) {
    res.render("urls_show", templateVars);
  } else {
    res.status(401).send("you do not have access to this page")
  }
});

app.get("/register", (req, res) => { // show register script to user
  const templateVars = { user: users[req.session.userId] };
  res.render("register", templateVars);
  res.redirect("/urls");
});

app.get("/login", (req, res) => { // Show login script to user
  const templateVars = { user: users[req.session.userId] };
  res.render("login", templateVars);
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => { // redirect user to longUrl
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longUrl;
  if (!longURL) {
    res.status(404).send("this url does not exist")
    return;
  } 
  res.redirect(`${longURL}`);
});

// POST Routes

app.post("/urls", (req, res) => { // generate new short url
  const shortUrl = generateRandomString(6);
  urlDatabase[shortUrl] = {
    longUrl: `https://${req.body.longURL}`,
    userId: req.session.userId,
  };
  res.redirect(`/urls/${shortUrl}`);
});

app.post("/register", (req, res) => { // run process to register a new user and store encrypted password 
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).send("fields cannot be blank");
  }
  const existingUser = searchUserByEmail(users, email);
  if (existingUser) {
    return res.status(400).send("the email address is already taken");
  }
  const userId = generateRandomString(6);
  const salt = bcrypt.genSaltSync(10); // encrypted password
  const hash = bcrypt.hashSync(password, salt);
  const user = { id: userId, email, password: hash };
  users[userId] = user;
  req.session.userId = userId;
  res.redirect("/urls");
});

app.post("/login", (req, res) => { // check if user information already exists to login
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("feilds cannot be blank");
  }
  const user = searchUserByEmail(users, email);
  if (!user) {
    return res.status(400).send("no user with that email found");
  }
  if (bcrypt.compareSync(password, user.password)) {
    req.session.userId = user.id;
    res.redirect("/urls");
  } else {
    return res.status(400).send("password does not match");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => { // delete shortUrl from urlDatabase
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => { // redirect to urls
  const longURL = req.body.longURL;
  const shortUrl = req.params.id;
  urlDatabase[shortUrl].longUrl = longURL; 
  // if (urlDatabase[shortUrl].userId === req.session.userId ) {
   res.redirect("/urls");
  // } else {
  //  res.status(401).send("you do not have access to this url")
  // }
});

app.post("/logout", (req, res) => { // logout user and remove session coookie
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => { // listening
  console.log(`Example app listening on port ${PORT}!`);
});
