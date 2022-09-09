const getUser = (email, usersDatabase) => {
  for (let user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      return usersDatabase[user];
    }
  }
  return false;
};

function generateRandomString() {
  return Math.random().toString(36).substring(7);
}

const urlsForUser = (id, urlDatabase) => {
  let userUrls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

module.exports = { getUser, generateRandomString, urlsForUser };
