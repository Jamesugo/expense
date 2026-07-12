const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  updateProfile,
  updateCurrency,
  updateTheme,
  updatePassword,
  deleteAccount,
} = require('../controllers/userController');

router.use(protect);

router.put('/profile', updateProfile);
router.put('/currency', updateCurrency);
router.put('/theme', updateTheme);
router.put('/password', updatePassword);
router.delete('/account', deleteAccount);

module.exports = router;
