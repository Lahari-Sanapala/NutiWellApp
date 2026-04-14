const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/NutriWell';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

const userSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    // other fields...
});

const User = mongoose.model('User', userSchema, 'users'); // 'users' is the collection name

async function listUsers() {
    try {
        const users = await User.find({}, 'fullName email _id');
        console.log('\n--- List of Users ---');
        if (users.length === 0) {
            console.log('No users found in the database.');
        } else {
            users.forEach(user => {
                console.log(`Name: ${user.fullName}, Email: ${user.email}, ID: ${user._id}`);
            });
        }
        console.log('---------------------\n');
    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        mongoose.connection.close();
    }
}

listUsers();
