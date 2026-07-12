const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, avatar } = req.body;

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        currency: user.currency,
        theme: user.theme,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user currency preference
// @route   PUT /api/users/currency
// @access  Private
const updateCurrency = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.currency = req.body.currency;
    await user.save();
    res.json({ success: true, currency: user.currency });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user theme preference
// @route   PUT /api/users/theme
// @access  Private
const updateTheme = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.theme = req.body.theme;
    await user.save();
    res.json({ success: true, theme: user.theme });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/users/password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const { currentPassword, newPassword } = req.body;

    if (user.password) {
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res, next) => {
  try {
    const Expense = require('../models/Expense');
    await Expense.deleteMany({ user: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateProfile, updateCurrency, updateTheme, updatePassword, deleteAccount };
