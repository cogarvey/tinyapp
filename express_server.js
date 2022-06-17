const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const res = require("express/lib/response");
const req = require("express/lib/request");
const bcrypt = require('bcryptjs');
const { getUser, generateRandomString, urlsForUser } = require("./helper-functions");
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["fbdsakls"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(bodyParser.urlencoded({ extended: true }));


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
};

const usersDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

// user 1
// password: "purple-monkey-dinosaur"

// user 2
// password: "dishwasher-funk"

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  let user_id = req.session.user_id;
  if (!user_id) {
    const templateVars = {
      status: 401,
      message: "Please log in or create account to access",
      user: null
    };
    return res.status(401).render("urls_error", templateVars);
  } else {
    let userURLs = urlsForUser(user_id, urlDatabase);
    const templateVars = {
      user: usersDatabase[req.session.user_id],
      urls: userURLs
    };
    return res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});

//CREATE NEW URLS
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  const templateVars = {
    user: usersDatabase[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let user_id = req.session.user_id;
  if (!user_id) {
    const templateVars = {
      status: 400,
      message: "Must be logged in to access",
      user: null
    };
    return res.status(401).render("urls_error", templateVars);
  } else {
    const shortURL = req.params.shortURL;
    const templateVars = {
      shortURL: shortURL,
      longURL: urlDatabase[shortURL].longURL,
      user: usersDatabase[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  }
});

app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    const templateVars = {
      status: 400,
      message: `${shortURL} does not exist`,
      user: null
    };
    return res.status(401).render("urls_error", templateVars);
  }
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// DELETE URLS
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect('/urls');
  } else {
    const templateVars = {
      status: 400,
      message: `You do not have access to ${shortURL}`,
      user: usersDatabase[req.session.user_id]
    };
    return res.status(401).render("urls_error", templateVars);
  }
});

//SHORT URL PAGE
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  // console.log(urlDatabase);
  urlDatabase[shortURL].longURL = longURL;
  // console.log(urlDatabase);
  res.redirect('/urls');
});

// LOG INS
app.get("/login", (req, res) => {
  const templateVars = {
    user: usersDatabase[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUser(email, usersDatabase);
  if (!user) {
    const templateVars = {
      status: 401,
      message: "Invalid Email",
      user: usersDatabase[req.session.user_id]
    };
    return res.status(401).render("urls_error", templateVars);
  }
  if (!bcrypt.compareSync(password, user.password)) {
    const templateVars = {
      status: 403,
      message: "Invalid password",
      user: null
    };
    return res.status(401).render("urls_error", templateVars);
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
});

// LOG OUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// REGISTER OR CREATE ACCOUNT
app.get("/register", (req, res) => {
  const templateVars = {
    user: usersDatabase[req.session.user_id]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  let id = generateRandomString();
  const user = {
    id,
    email: req.body.email,
    password: bcrypt.hashSync(password, 10)
  };
  if (!email || !password) {
    const templateVars = {
      status: 401,
      message: "Empty user and/or password",
      user: null
    };
    return res.status(401).render("urls_error", templateVars);
  }
  if (getUser(email, usersDatabase)) {
    const templateVars = {
      status: 409,
      message: "Email already exists",
      user: null
    };
    return res.status(401).render("urls_error", templateVars);
  }
  usersDatabase[id] = user;
  req.session.user_id = user.id;
  res.redirect('/urls');
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}  !`);
});


