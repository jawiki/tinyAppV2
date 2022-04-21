const express = require("express");
const app = express();
const PORT = 6060; // default port 8080
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const res = require("express/lib/response");
const cookieSession = require("cookie-session");
const { generateRandomString, searchUserByEmail } = require("./helpers");
const req = require("express/lib/request");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ name: "session", keys: ["hello", "world"] }));

//////////////////////////DATA///////////////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const urlsForUser = function (id) {
  console.log("id", id);
  console.log("urldatabase", urlDatabase);
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

const urlDatabase = {
  b2xVn2: {
    longUrl: "http://www.lighthouselabs.ca",
    userId: "grrIQ",
  },
  "9sm5xK": {
    longUrl: "http://www.google.com",
    userId: "grrIQ",
  },
};

const users = {
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

//////////////////////////APP.GET///////////////////////////////////

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userId = req.session.userId;
  console.log(userId);

  if (!users[userId]) {
    res.status(400).send("please login first");
    return;
  } //error
  for (let user in users) {
    if (users[user].id === userId) {
      const urls = urlsForUser(userId);
      console.log("urls", urls);
      const templateVars = { urls, user: users[user] };
      res.render("urls_index", templateVars);
    }
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longUrl,
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("login", templateVars);
});

//////////////////////////APP.POST///////////////////////////////////

app.post("/urls", (req, res) => {
  console.log(req.body);
  const shortUrl = generateRandomString(6);
  urlDatabase[shortUrl] = {
    longUrl: req.body.longURL,
    userId: req.session.userId,
  };
  res.redirect(`/urls/${shortUrl}`);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("feilds cannot be blank");
  }
  const existingUser = searchUserByEmail(users, email);
  if (existingUser) {
    return res.status(400).send("the email address is already taken");
  }
  const userId = generateRandomString(6);
  const salt = bcrypt.genSaltSync(10); //syncronous
  const hash = bcrypt.hashSync(password, salt);
  const user = { id: userId, email, password: hash };
  users[userId] = user;
  req.session.userId = userId;
  console.log(userId);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
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

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const shortUrl = req.params.id;
  urlDatabase[shortUrl].longUrl = longURL; ///
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});
