const User = require('../models/User')

class UserRepository {
  async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email })
    if (includePassword) {
      query.select('+password')
    }
    return await query
  }

  async findById(id, includePassword = false) {
    const query = User.findById(id)
    if (includePassword) {
      query.select('+password')
    }
    return await query
  }

  async create(userData) {
    return await User.create(userData)
  }

  async updateById(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    })
  }

  async findByResetToken(hashedToken) {
    return await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    })
  }

  async findBySocialProviderOrEmail(provider, uid, email) {
    const query = {}
    query[`socialProviders.${provider}.uid`] = uid
    return await User.findOne({
      $or: [query, { email }]
    })
  }
}

module.exports = new UserRepository()
