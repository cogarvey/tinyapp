const { assert } = require("chai");

const { getUser } = require("../helper-functions.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUser", function () {
  it("should return a user with valid email", function () {
    const user = getUser("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.deepEqual(user.id, expectedUserID);
  });

  it("should return undefined when an invalid email passed", function () {
    const user = getUser("hello@example.com", testUsers);
    assert.deepEqual(user.id, undefined);
  });
});
