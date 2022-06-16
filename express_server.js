const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const res = require("express/lib/response");
const req = require("express/lib/request");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};



function generateRandomString() {
  return Math.random().toString(36).substring(7);
};

const getUserByEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

const urlsForUser = (id => {
  let userUrls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
});



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  let userURLs = urlsForUser(req.cookies.user_id);
  if (!req.cookies.user_id) {
    return res.status(400).send("You must be logged in to access");
  } else {
    const templateVars = {
      user: users[req.cookies.user_id],
      urls: userURLs
    };
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies.user_id };
  res.redirect(`/urls/${shortURL}`);
});

//CREATE NEW URLS
app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login");
  }
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let userURLs = urlsForUser(req.cookies.user_id);
  if (!req.cookies.user_id) {
    return res.status(400).send("You must be logged in to access");
  } else {
    const shortURL = req.params.shortURL;
    const templateVars = {
      shortURL: shortURL,
      longURL: urlDatabase[shortURL].longURL,
      user: users[req.cookies.user_id]
    };
    // console.log("*****", urlDatabase);
    res.render("urls_show", templateVars);
  }
});

app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(400).send(`${shortURL} does not exist`);
  }
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// DELETE URLS
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

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
    user: users[req.cookies.user_id]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = getUserByEmail(email);
  if (!user) {
    return res.status(403).send("User does not exist");
  }
  if (user.password !== password) {
    return res.status(403).send("Invalid Password");
  }

  res.cookie("user_id", user.id);
  res.redirect('/urls');
});

// LOG OUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.cookies.user_id);
  res.redirect('/urls');
});

// REGISTER OR CREATE ACCOUNT
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  let id = generateRandomString();
  const user = {
    id,
    email: req.body.email,
    password: req.body.password
  };
  if (!email || !password) {
    return res.status(401).send("Empty user and/or password");
  }
  if (getUserByEmail(email)) {
    return res.status(409).send("Email already exists");
  }
  users[id] = user;
  res.cookie("user_id", user.id);
  res.redirect('/urls');
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}  !`);
});
