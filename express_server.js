const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");


app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser())

app.set("view engine", "ejs");

const urlDatabase = {};

const users = {}

const generateRandomString = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  
  while (randomString.length <= 6) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }

  return randomString;
};

const findUserEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return false;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//URL list page (home)
app.get("/urls", (req, res) => {
  const userID = req.cookies['user_id'];
  const userURLs = urlsForUser(userID);
  let templateVars = { urls: userURLs, user: users[userID] };
  res.render('urls_index', templateVars);
});

//Page for creating new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] }
  res.render("urls_new", templateVars)
})

//Page showing specific URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL,user: users[req.cookies['user_id']] };
  res.render("urls_show", templateVars);
})

// Redirect short URL to long
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL)
})

// Add new URL functionality
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL
  res.redirect("/urls/new");
});

//Edit URL and redirect back
app.post("/urls/:id", (req, res) => {
  const id = req.params.id
  urlDatabase[id] = req.body.updatedURL
})

//delete URL and redirect back
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect("/urls")
})

//GET login page
app.get('/login', (req, res) => {
  let templateVars = {user: users[req.cookies['user_id']]};
  res.render('urls_login', templateVars);
});

//Registration page GET & Render
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] }
  res.render("urls_registration", templateVars)
})

// login handler
app.post('/login', (req, res) => {
  const user = findUserEmail(req.body.email, users);
  if (user) {
    if (req.body.password === user.password) {
      res.cookie('user_id', user.userID);
      res.redirect('/urls');
    } else {
      res.statusCode = 403;
      res.send('<h2>403 Forbidden<br>You entered the wrong password.</h2>')
    }
  } else {
    res.statusCode = 403;
    res.send('<h2>403 Forbidden<br>This email address is not registered.</h2>')
  }
});

//Registration handler
app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
    if (!findUserEmail(req.body.email, users)) {
      const userID = generateRandomString();
      users[userID] = {
        userID,
        email: req.body.email,
        password: req.body.password
      }
      res.cookie('user_id', userID);
      res.redirect('/urls');
    } else {
      res.statusCode = 400;
      res.send('<h2>400  Bad Request<br>Email already registered.</h2>')
    }
  } else {
    res.statusCode = 400;
    res.send('<h2>400  Bad Request<br>Please fill out the email and password fields.</h2>')
  }
})

//Logout handler
app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});