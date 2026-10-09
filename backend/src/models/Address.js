const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Adres başlığı gereklidir'],
    trim: true
  },
  fullName: {
    type: String,
    required: [true, 'Ad soyad gereklidir'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Telefon gereklidir']
  },
  city: {
    type: String,
    required: [true, 'Şehir gereklidir']
  },
  district: {
    type: String,
    required: [true, 'İlçe gereklidir']
  },
  neighborhood: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    required: [true, 'Adres gereklidir']
  },
  zipCode: {
    type: String,
    default: '34000'
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Kullanıcı için sadece bir varsayılan adres olabilir
addressSchema.pre("save", async function() {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
})

module.exports = mongoose.model('Address', addressSchema)
