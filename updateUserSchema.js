const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from a .env file if needed

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/tambola', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Define the user schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isAdmin: {
        type: Boolean,
        default: false, // Default value for new documents
    },
});

const User = mongoose.model('User', userSchema);

// Script to update existing records
const addIsAdminField = async () => {
    try {
        await connectDB();

        // Update existing users to include the isAdmin field with a default value
        const result = await User.updateMany(
            { isAdmin: { $exists: false } }, // Only update documents without the isAdmin field
            { $set: { isAdmin: false } } // Add the field with a default value
        );

        console.log(`Updated ${result.nModified} users to include the isAdmin field.`);

        // Close the database connection
        mongoose.connection.close();
    } catch (error) {
        console.error('Error updating users:', error);
        mongoose.connection.close();
        process.exit(1);
    }
};

// Run the script
addIsAdminField();
