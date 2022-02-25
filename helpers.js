const generateRandomString = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  
  while (randomString.length < 6) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }

  return randomString;
};

const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
  return undefined;
};

const userURLs = (user, database) => {
  let urls = {};

  for (const shortURL in database) {
    if (database[shortURL].id === user) {
      urls[shortURL] = database[shortURL];
    }
  }
  return urls;
};

module.exports = { generateRandomString, getUserByEmail, userURLs };