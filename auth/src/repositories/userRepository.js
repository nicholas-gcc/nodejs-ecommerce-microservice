const User = require("../models/user");

class UserRepository {
  async createUser(user) {
    return await User.create(user);
  }

  async getUserByUsername(username) {
    return await User.findOne({ username });
  }
}

module.exports = UserRepository;
