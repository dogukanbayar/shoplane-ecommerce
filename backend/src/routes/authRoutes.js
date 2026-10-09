const express = require('express')
const router = express.Router()
const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  socialLogin
} = require('../controllers/authController')
const { protect } = require('../middleware/auth')

router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refreshToken)
router.post('/logout', logout)
router.post('/forgot-password', forgotPassword)
router.put('/reset-password/:resetToken', resetPassword)
router.post('/social-login', socialLogin)

router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.put('/password', protect, changePassword)

module.exports = router
