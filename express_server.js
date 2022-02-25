const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { generateRandomString, getUserByEmail, userURLs } = require("./helpers");

// Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["user_ID"]
}));

// Stores
const urlDatabase = {};

const users = {
  user999999: {
    id: 'user999999',
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
  const userID = req.session.user_ID;
  if (users[userID]) {
    const usersURLs = userURLs(userID, urlDatabase);
    const templateVars = { urls: usersURLs, user: users[userID] };
  
    return res.render('urls_index', templateVars);
  }
  res.redirect("/login");

});

//Page for creating new URL
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_ID;
  if (users[userID]) {
    let templateVars = {user: users[userID]};
    return res.render('urls_new', templateVars);
  }
  res.redirect("/login");
});

//Page showing specific URL
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session["user_ID"];
  const usersURLs = userURLs(userID, urlDatabase);
  let templateVars = { urls: usersURLs, user: users[userID], shortURL: req.params.shortURL, longURL: req.body.longURL };
  res.render('urls_show', templateVars);
});

// Redirect short URL to long
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (longURL) {
    return res.redirect(`https://${longURL}`);
  } else {
    res.statusCode = 404;
    res.send('<h2>404 Not Found<br>This short URL does not exist.</h2>');
  }
});

// Add new URL functionality
app.post("/urls", (req, res) => {
  const userID = req.session["user_ID"];
  if (userID) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      id: req.session["user_ID"]
    };
  }
  res.redirect("/urls");
});

//Edit URL and redirect back
app.post("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  if (req.session["user_ID"] === urlDatabase[shortURL].id) {
    urlDatabase[shortURL].longURL = req.body.updatedURL;
    return res.redirect("/urls");
  }

  res.redirect(`/login`);
});

//delete URL and redirect back
app.post("/urls/:shortURL/delete", (req, res) => {
  const { shortURL } = req.params;
  if (req.session["user_ID"] === urlDatabase[shortURL].id) {
    delete urlDatabase[shortURL];
  }
  res.redirect("/urls");
});

//GET login page
app.get('/login', (req, res) => {
  const templateVars = {user: users[req.session["user_ID"]]};
  res.render('urls_login', templateVars);
});

//Registration page GET & Render
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session["user_ID"]] };
  res.render("urls_registration", templateVars);
});

// login handler
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const userID = getUserByEmail(email, users);
  if (userID) {
    if (bcrypt.compareSync(password, users[userID].password)) {
      req.session.user_ID = userID;
      return res.redirect('/urls');
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
    if (!getUserByEmail(req.body.email, users)) {
      const userID = generateRandomString();
      users[userID] = {
        id: userID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      req.session['user_ID'] = userID;
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
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});