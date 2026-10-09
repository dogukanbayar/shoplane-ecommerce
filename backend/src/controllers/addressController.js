const Address = require('../models/Address')

// @desc    Kullanıcının adreslerini getir
// @route   GET /api/addresses
// @access  Private
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user.id })

    res.status(200).json({
      success: true,
      count: addresses.length,
      addresses
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Tek adres getir
// @route   GET /api/addresses/:id
// @access  Private
exports.getAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id)

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Adres bulunamadı'
      })
    }

    // Kullanıcı kontrolü
    if (address.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu adresi görüntüleme yetkiniz yok'
      })
    }

    res.status(200).json({
      success: true,
      address
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Adres oluştur
// @route   POST /api/addresses
// @access  Private
exports.createAddress = async (req, res, next) => {
  try {
    const body = {
      ...req.body,
      address: req.body.address || req.body.addressDetail,
      zipCode: req.body.zipCode || req.body.postalCode || "34000",
      user: req.user.id
    };
    const address = await Address.create(body)

    res.status(201).json({
      success: true,
      address
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Adres güncelle
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    let address = await Address.findById(req.params.id)

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Adres bulunamadı'
      })
    }

    // Kullanıcı kontrolü
    if (address.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu adresi güncelleme yetkiniz yok'
      })
    }

    address = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    res.status(200).json({
      success: true,
      address
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Adres sil
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id)

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Adres bulunamadı'
      })
    }

    // Kullanıcı kontrolü
    if (address.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu adresi silme yetkiniz yok'
      })
    }

    await address.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Adres silindi'
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Varsayılan adres yap
// @route   PUT /api/addresses/:id/default
// @access  Private
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id)

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Adres bulunamadı'
      })
    }

    // Kullanıcı kontrolü
    if (address.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu adresi güncelleme yetkiniz yok'
      })
    }

    address.isDefault = true
    await address.save()

    res.status(200).json({
      success: true,
      address
    })
  } catch (error) {
    next(error)
  }
}