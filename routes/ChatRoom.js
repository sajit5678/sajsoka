const mongoose = require('mongoose');

// Define the ChatRoom schema
const ChatRoomSchema = new mongoose.Schema({
  chatRoomId: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  comingUp: {
    type: Boolean,
    default: true, // Default value set to true
  },
});

// Export the model
const ChatRoom = mongoose.model('ChatRoom', ChatRoomSchema);

module.exports = ChatRoom;