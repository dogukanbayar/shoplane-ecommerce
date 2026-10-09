const authService = require('../services/authService')
const { sendToken } = require('../utils/jwtToken')

// @desc    Kayıt ol
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body)
    sendToken(user, 201, res)
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message })
    }
    next(error)
  }
}

// @desc    Giriş yap
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await authService.login(email, password)
    sendToken(user, 200, res)
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message })
    }
    next(error)
  }
}

// @desc    Token Yenile (Refresh Token)
// @route   POST /api/auth/refresh
// @access  Public (Cookie veya Body tabanlı)
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken
    const { accessToken } = await authService.refreshToken(token)

    res.status(200).json({
      success: true,
      accessToken,
      token: accessToken
    })
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message })
    }
    next(error)
  }
}

// @desc    Çıkış yap
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true })
    res.cookie('refreshToken', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true })

    res.status(200).json({
      success: true,
      message: 'Çıkış başarılı'
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Mevcut kullanıcı bilgisi
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id)
    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message })
    }
    next(error)
  }
}

// @desc    Profil güncelle
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body)
    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Şifre değiştir
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await authService.changePassword(req.user.id, currentPassword, newPassword)
    sendToken(user, 200, res)
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message })
    }
    next(error)
  }
}

// @desc    Şifremi unuttum
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    const { resetToken } = await authService.forgotPassword(email)

    res.status(200).json({
      success: true,
      message: 'Şifre sıfırlama bağlantısı e-postanıza gönderildi',
      resetToken
    })
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message })
    }
    next(error)
  }
}

// @desc    Şifre sıfırla
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { resetToken } = req.params
    const { password } = req.body
    const user = await authService.resetPassword(resetToken, password)
    sendToken(user, 200, res)
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message })
    }
    next(error)
  }
}

// @desc    Social Login
// @route   POST /api/auth/social-login
// @access  Public
exports.socialLogin = async (req, res, next) => {
  try {
    const user = await authService.socialLogin(req.body)
    sendToken(user, 200, res)
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message })
    }
    next(error)
  }
}
