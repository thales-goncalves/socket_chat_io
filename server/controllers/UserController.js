const User = require('../models/User');

module.exports = {
  async index() {
    let users = await User.find();
    return users;
  },

  async store(email, username, address, phone, password) {
    let user = await findUserByEmail(email);
    if (user) {
      return {
        code: 400,
        message: 'This email is already been used!'
      };
    } else {
      user = await User.create({
        email,
        username,
        address,
        phone,
        password
      });
      return user;
    }
  },

  async show(email, password) {
    let user = await findUserByEmail(email);

    if (!user) {
      return {
        code: 404,
        message: 'User not found'
      };
    } else if (user.password !== password) {
      return {
        code: 400,
        message: 'Wrong password'
      };
    }
    return user;
  },

  async update(id, email, username, address, phone, password) {
    let user = {
      email,
      username,
      address,
      phone,
      password
    };
    console.log(id, email, username, address, phone, password);
    return await User.findByIdAndUpdate(id, user);
  },

  async destroy(email) {
    await User.findOneAndDelete({ email });
    return {
      code: 200,
      message: 'Successfully Deleted'
    };
  }
};

async function findUserByEmail(email) {
  return await User.findOne({ email });
}
