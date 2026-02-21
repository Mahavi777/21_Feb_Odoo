// Script to seed demo users in the database
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/modules/users/user.model');

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    const demoUsers = [
      {
        name: 'Alex Morgan',
        email: 'manager@fleetflow.io',
        password: 'password',
        role: 'manager',
        licenseNumber: 'MGR001',
        licenseExpiry: new Date('2027-12-31'),
        status: 'onDuty',
        safetyScore: 100,
      },
      {
        name: 'Sam Rivera',
        email: 'dispatch@fleetflow.io',
        password: 'password',
        role: 'dispatcher',
        licenseNumber: 'DL123456',
        licenseExpiry: new Date('2027-12-31'),
        status: 'onDuty',
        safetyScore: 95,
      },
      {
        name: 'Jordan Lee',
        email: 'safety@fleetflow.io',
        password: 'password',
        role: 'safety',
        licenseNumber: 'SAF001',
        licenseExpiry: new Date('2027-12-31'),
        status: 'onDuty',
        safetyScore: 100,
      },
      {
        name: 'Casey Kim',
        email: 'finance@fleetflow.io',
        password: 'password',
        role: 'finance',
        licenseNumber: 'FIN001',
        licenseExpiry: new Date('2027-12-31'),
        status: 'offDuty',
        safetyScore: 100,
      },
    ];

    // Check for existing users
    for (const userData of demoUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.email}`);
      } else {
        console.log(`⏭️  User already exists: ${userData.email}`);
      }
    }

    console.log('\n✅ Demo users seeding completed!');
    console.log('\nYou can now login with:\n');
    console.log('Manager: manager@fleetflow.io / password');
    console.log('Dispatcher: dispatch@fleetflow.io / password');
    console.log('Safety: safety@fleetflow.io / password');
    console.log('Finance: finance@fleetflow.io / password');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    process.exit(1);
  }
};

seedUsers();
