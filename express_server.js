const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");


app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser())

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  
  while (randomString.length <= 6) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }

  return randomString;
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] }
  res.render("urls_new", templateVars)
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL, username: req.cookies["username"] };
  res.render("urls_show", templateVars);
})

// Redirect short URL to long...
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL)
})

// Add new URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL
  res.redirect("/urls/new");
});

//delete URL and redirect back
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect("/urls")
})

//Edit URL and redirect back
app.post("/urls/:id", (req, res) => {
  const id = req.params.id
  urlDatabase[id] = req.body.updatedURL
})

//Login handler
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect("/urls")
})

//Logout handler
app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect("/urls")
})

//Registration page GET & Render
app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies["username"] }
  res.render("urls_registration", templateVars)
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});