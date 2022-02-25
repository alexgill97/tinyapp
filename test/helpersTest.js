const { assert } = require('chai');

const { getUserByEmail, userURLs, generateRandomString } = require('../helpers.js');

const testUsers = {
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

const testURLDatabase = {
  b6UTxQ: { longURL: "https://www.amazon.ca", id: "userRandomID" },
  gfd96s: { longURL: "https://www.youtube.com", id: "sdfgsfdg" },
  o4jva0: { longURL: "https://www.reddit.com", id: "sdfgdf" }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, expectedUserID);
  });
  it('Should return undefined if providing an invalid email', ()=>{
    const user = getUserByEmail('nonexistant@gmail.com', testUsers);
    assert.isUndefined(user);
  });
});

describe('generateRandomString', ()=>{
  it('Should return a string of random values', ()=>{
    const result = generateRandomString();
    assert.isString(result);
  });
  it('Should have a length of 6', ()=>{
    const result = generateRandomString().length;
    assert.strictEqual(result, 6);
  });
});

describe('userURLs', function() {
  it('should return an empty object if user has no URLs', function() {
    const actual = userURLs("user2RandomID", testURLDatabase);
    const expected = {};
    assert.deepEqual(actual, expected);
  });

  it('should return an object with shortURLs', function() {
    const actual = userURLs("userRandomID", testURLDatabase);
    console.log(actual);
    const expected = { b6UTxQ: { longURL: 'https://www.amazon.ca', id: 'userRandomID' } };
    assert.deepEqual(actual, expected);
  });
});