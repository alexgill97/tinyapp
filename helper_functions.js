const generateRandomString = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  
  while (randomString.length <= 6) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }

  return randomString;
};

const userEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return false;
};

const userURLs = (user, database) => {
  let urls = {};

  for (const shortURL in database) {
    if (database[shortURL].id === user) {
      urls[shortURL] = database[shortURL];
    }
  }
  console.log(urls)
  return urls;
};

module.exports = { generateRandomString, userEmail, userURLs };