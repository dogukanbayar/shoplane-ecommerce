javascript
const mongoose = require('mongoose')

const touchpointSchema = new mongoose.Schema({
  // Touchpoint definition (template)
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  
  type: {
    type: String,
    required: true
  },
  
  // Journey stage this typically belongs to
  primaryStage: {
    type: String,
    enum: ['awareness', 'consideration', 'decision', 'purchase', 'retention', 'advocacy']
  },
  
  // Channel
  channel: String,
  
  // Expected behavior/outcome
  expectedOutcome: String,
  
  // Metrics
  analytics: {
    totalOccurrences: {
      type: Number,
      default: 0
    },
    uniqueUsers: {
      type: Number,
      default: 0
    },
    avgTimeToNext: Number, // Seconds
    conversionRate: Number, // Percentage
    dropOffRate: Number // Percentage
  },
  
  // Optimization notes
  optimizationNotes: String,
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Index
touchpointSchema.index({ type: 1 })
touchpointSchema.index({ primaryStage: 1 })

module.exports = mongoose.model('Touchpoint', touchpointSchema)