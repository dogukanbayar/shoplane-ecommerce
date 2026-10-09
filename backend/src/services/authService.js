const userRepository = require('../repositories/userRepository')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const emailService = require('../utils/emailService')
const { generateAccessToken } = require('../utils/jwtToken')

class AuthService {
  async register({ name, email, password, phone }) {
    // E-posta format doğrulaması
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      const error = new Error('Geçerli bir e-posta adresi giriniz')
      error.statusCode = 400
      throw error
    }

    const existingUser = await userRepository.findByEmail(email)
    if (existingUser) {
      const error = new Error('Bu e-posta adresi zaten kullanılıyor')
      error.statusCode = 400
      throw error
    }

    const user = await userRepository.create({ name, email, password, phone })

    try {
      await emailService.sendWelcomeEmail(user)
    } catch (mailError) {
      console.log('Welcome mail gönderilemedi:', mailError.message)
    }

    return user
  }

  async login(email, password) {
    if (!email || !password) {
      const error = new Error('Lütfen e-posta ve şifrenizi girin')
      error.statusCode = 400
      throw error
    }

    const normalizedEmail = (email || "").trim().toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail, true)
    if (!user) {
      const error = new Error('E-posta veya şifre hatalı')
      error.statusCode = 401
      throw error
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      const error = new Error('E-posta veya şifre hatalı')
      error.statusCode = 401
      throw error
    }

    return user
  }

  async refreshToken(token) {
    if (!token) {
      const error = new Error('Refresh token bulunamadı')
      error.statusCode = 401
      throw error
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET || 'shoplane_default_refresh_secret'
      )
      const user = await userRepository.findById(decoded.id)
      if (!user) {
        const error = new Error('Kullanıcı bulunamadı')
        error.statusCode = 401
        throw error
      }

      const newAccessToken = generateAccessToken(user)
      return { accessToken: newAccessToken, user }
    } catch (err) {
      const error = new Error('Geçersiz veya süresi dolmuş refresh token')
      error.statusCode = 403
      throw error
    }
  }

  async getMe(userId) {
    const user = await userRepository.findById(userId)
    if (!user) {
      const error = new Error('Kullanıcı bulunamadı')
      error.statusCode = 404
      throw error
    }
    return user
  }

  async updateProfile(userId, { name, email, phone }) {
    return await userRepository.updateById(userId, { name, email, phone })
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId, true)
    if (!user) {
      const error = new Error('Kullanıcı bulunamadı')
      error.statusCode = 404
      throw error
    }

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      const error = new Error('Mevcut şifre hatalı')
      error.statusCode = 401
      throw error
    }

    user.password = newPassword
    await user.save()
    return user
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email)
    if (!user) {
      const error = new Error('Bu e-posta adresine kayıtlı kullanıcı bulunamadı')
      error.statusCode = 404
      throw error
    }

    const resetToken = crypto.randomBytes(20).toString('hex')
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000

    await user.save({ validateBeforeSave: false })

    return { resetToken, user }
  }

  async resetPassword(resetToken, newPassword) {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    const user = await userRepository.findByResetToken(resetPasswordToken)
    if (!user) {
      const error = new Error('Geçersiz veya süresi dolmuş token')
      error.statusCode = 400
      throw error
    }

    user.password = newPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    return user
  }

  async socialLogin({ provider, uid, email, name, avatar }) {
    if (!provider || !uid || !email) {
      const error = new Error('Provider, UID ve email alanları gerekli')
      error.statusCode = 400
      throw error
    }

    let user = await userRepository.findBySocialProviderOrEmail(provider, uid, email)

    if (user) {
      if (!user.socialProviders[provider]?.connected) {
        user.socialProviders[provider] = {
          uid,
          email,
          avatar: avatar || '',
          connected: true
        }
        if (!user.avatar && avatar) {
          user.avatar = avatar
        }
        await user.save()
      }
    } else {
      user = await userRepository.create({
        name: name || email.split('@')[0],
        email,
        phone: '',
        avatar: avatar || '',
        socialProviders: {
          [provider]: {
            uid,
            email,
            avatar: avatar || '',
            connected: true
          }
        }
      })
    }

    return user
  }
}

module.exports = new AuthService()
