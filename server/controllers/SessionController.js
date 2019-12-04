const User = require('../models/User');

module.exports = {
  async store(req, res) {
    const { email } = req.body;
    const { password } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      res.json({
        error: 404,
        message: 'User not found'
      });
    } else if (user.password !== password) {
      res.json({
        error: 400,
        message: 'Wrong password'
      });
    }
    return res.json(user);
  },
  async destroy(req, res) {}
};
