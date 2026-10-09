const jwt = require('jsonwebtoken')

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'shoplane_default_jwt_secret',
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
  )
}

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'shoplane_default_refresh_secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  )
}

const sendToken = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }

  const userResponse = user.toObject ? user.toObject() : { ...user }
  delete userResponse.password

  res
    .status(statusCode)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .cookie('token', accessToken, { ...cookieOptions, expires: new Date(Date.now() + 15 * 60 * 1000) })
    .json({
      success: true,
      user: userResponse,
      accessToken,
      token: accessToken
    })
}

module.exports = { sendToken, generateAccessToken, generateRefreshToken }
