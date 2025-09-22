const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../src/models/User');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms_dev';

async function run() {
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const email = 'admin@gmail.com';
    const password = 'admin@gmail.com';
    const name = 'Admin';

    let user = await User.findOne({ email });
    if (user) {
        user.name = name;
        user.password = password; // will be hashed by pre-save
        user.isAdmin = true;
        await user.save();
        console.log('Updated existing admin user:', email);
    } else {
        user = new User({ name, email, password, isAdmin: true });
        await user.save();
        console.log('Created admin user:', email);
    }

    await mongoose.disconnect();
    console.log('Done');
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
