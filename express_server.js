const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs")
const { generateRandomString, userEmail, userURLs } = require("./helper_functions");

// Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

// Stores
const urlDatabase = {};
const users = {
  user1: {
    id: 'Adam',
    email: 'a@a.com',
    password: bcrypt.hashSync('test', 10)
  }
};

// END POINTS

//Home page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//URL list page (home)
app.get("/urls", (req, res) => {
  const userID = req.cookies['user_id'];
  if (!users[userID]) {
    res.redirect("/login");
  }
  const usersURLs = userURLs(userID, urlDatabase);
  const templateVars = { urls: usersURLs, user: users[userID] };

  res.render('urls_index', templateVars);
});

//Page for creating new URL
app.get("/urls/new", (req, res) => {
  const userID = req.cookies['user_id'];
  if (!users[userID]) {
    res.redirect("/login");
  }
  let templateVars = {user: users[userID]};
  res.render('urls_new', templateVars);
});

//Page showing specific URL
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies['user_id'];
  const usersURLs = userURLs(userID, urlDatabase);
  let templateVars = { urls: usersURLs, user: users[userID], shortURL: req.params.shortURL, longURL: req.body.longURL };
  res.render('urls_show', templateVars);
});

// Redirect short URL to long
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (longURL) {
    res.redirect(`https://${longURL}`);
  } else {
    res.statusCode = 404;
    res.send('<h2>404 Not Found<br>This short URL does not exist.</h2>');
  }
});

// Add new URL functionality
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  };
  res.redirect(`/urls/${shortURL}`);
});

//Edit URL and redirect back
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  if (req.cookies['user_id'] === urlDatabase[id].userID) {
    urlDatabase[id].longURL = req.body.updatedURL;
  }

  res.redirect(`/urls/${id}`);
});

//delete URL and redirect back
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.cookies['user_id'] === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
  }
  res.redirect("/urls");
});

//GET login page
app.get('/login', (req, res) => {
  const templateVars = {user: users[req.cookies['user_id']]};
  res.render('urls_login', templateVars);
});

//Registration page GET & Render
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render("urls_registration", templateVars);
});

// login handler
app.post('/login', (req, res) => {
  const user = userEmail(req.body.email, users);
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      res.cookie('user_id', user.userID);
      res.redirect('/urls');
    } else {
      res.statusCode = 403;
      res.send('<h2>403 Forbidden<br>You entered the wrong password.</h2>');
    }
  } else {
    res.statusCode = 403;
    res.send('<h2>403 Forbidden<br>This email address is not registered.</h2>');
  }
});

//Registration handler
app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
    if (!userEmail(req.body.email, users)) {
      const userID = generateRandomString();
      users[userID] = {
        userID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      res.cookie('user_id', userID);
      res.redirect('/urls');
    } else {
      res.statusCode = 400;
      res.send('<h2>400  Bad Request<br>Email already registered.</h2>');
    }
  } else {
    res.statusCode = 400;
    res.send('<h2>400  Bad Request<br>Please fill out the email and password fields.</h2>');
  }
});

//Logout handler
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});