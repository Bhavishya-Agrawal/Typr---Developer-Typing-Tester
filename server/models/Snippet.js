const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      required: true,
      enum: ['python', 'javascript', 'java', 'cpp']
    },
    bucket: {
      type: String,
      required: true,
      enum: ['words30', 'words50', 'words100']
    },
    code: {
      type: String,
      required: true
    },
    wordCount: {
      type: Number,
      default: 0
    },
    charCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

snippetSchema.index({ language: 1, bucket: 1 });

module.exports = mongoose.model('Snippet', snippetSchema);
