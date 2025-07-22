const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Admin = require('../models/Admin');
const Charity = require('../models/Charity');
const Donation = require('../models/Donation');
const FoodSlot = require('../models/FoodSlot');
const Notification = require('../models/Notification');

// Sample data
const sampleCharities = [
  {
    name: "Hope Foundation",
    description: "Dedicated to providing education and healthcare to underprivileged children worldwide.",
    category: "Education",
    contactEmail: "contact@hopefoundation.org",
    contactPhone: "+1-555-0101",
    address: {
      street: "123 Hope Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA"
    },
    website: "https://hopefoundation.org",
    targetAmount: 100000,
    raisedAmount: 45000,
    registrationNumber: "HF001",
    bankDetails: {
      accountName: "Hope Foundation",
      accountNumber: "1234567890",
      bankName: "First National Bank",
      routingNumber: "021000021"
    },
    socialMedia: {
      facebook: "https://facebook.com/hopefoundation",
      twitter: "https://twitter.com/hopefoundation"
    }
  },
  {
    name: "Green Earth Initiative",
    description: "Working towards environmental conservation and sustainable development practices.",
    category: "Environment",
    contactEmail: "info@greenearth.org",
    contactPhone: "+1-555-0102",
    address: {
      street: "456 Green Avenue",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      country: "USA"
    },
    website: "https://greenearth.org",
    targetAmount: 200000,
    raisedAmount: 89000,
    registrationNumber: "GEI002",
    bankDetails: {
      accountName: "Green Earth Initiative",
      accountNumber: "2345678901",
      bankName: "Pacific Bank",
      routingNumber: "121000248"
    }
  },
  {
    name: "Medical Aid Global",
    description: "Providing medical assistance and healthcare services to communities in need.",
    category: "Healthcare",
    contactEmail: "help@medicalaidglobal.org",
    contactPhone: "+1-555-0103",
    address: {
      street: "789 Health Way",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "USA"
    },
    website: "https://medicalaidglobal.org",
    targetAmount: 150000,
    raisedAmount: 67000,
    registrationNumber: "MAG003"
  },
  {
    name: "Food for All",
    description: "Fighting hunger by providing meals and food assistance to those in need.",
    category: "Food & Hunger",
    contactEmail: "contact@foodforall.org",
    contactPhone: "+1-555-0104",
    address: {
      street: "321 Nutrition Street",
      city: "Houston",
      state: "TX",
      zipCode: "77001",
      country: "USA"
    },
    website: "https://foodforall.org",
    targetAmount: 80000,
    raisedAmount: 52000,
    registrationNumber: "FFA004"
  },
  {
    name: "Animal Rescue Center",
    description: "Rescuing and caring for abandoned and abused animals.",
    category: "Animals",
    contactEmail: "rescue@animalrescue.org",
    contactPhone: "+1-555-0105",
    address: {
      street: "654 Pet Lane",
      city: "Miami",
      state: "FL",
      zipCode: "33101",
      country: "USA"
    },
    website: "https://animalrescue.org",
    targetAmount: 60000,
    raisedAmount: 31000,
    registrationNumber: "ARC005"
  },
  {
    name: "Disaster Relief Network",
    description: "Providing emergency aid and support during natural disasters and crises.",
    category: "Disaster Relief",
    contactEmail: "emergency@disasterrelief.org",
    contactPhone: "+1-555-0106",
    address: {
      street: "987 Emergency Blvd",
      city: "Denver",
      state: "CO",
      zipCode: "80201",
      country: "USA"
    },
    website: "https://disasterrelief.org",
    targetAmount: 300000,
    raisedAmount: 145000,
    registrationNumber: "DRN006"
  },
  {
    name: "Youth Development Society",
    description: "Empowering young people through education, mentorship, and skill development programs.",
    category: "Education",
    contactEmail: "youth@youthdev.org",
    contactPhone: "+1-555-0107",
    address: {
      street: "147 Youth Center Dr",
      city: "Atlanta",
      state: "GA",
      zipCode: "30301",
      country: "USA"
    },
    website: "https://youthdev.org",
    targetAmount: 120000,
    raisedAmount: 78000,
    registrationNumber: "YDS007"
  },
  {
    name: "Senior Care Alliance",
    description: "Supporting elderly community members with healthcare, companionship, and daily living assistance.",
    category: "Healthcare",
    contactEmail: "care@seniorcare.org",
    contactPhone: "+1-555-0108",
    address: {
      street: "258 Elder Way",
      city: "Phoenix",
      state: "AZ",
      zipCode: "85001",
      country: "USA"
    },
    website: "https://seniorcare.org",
    targetAmount: 90000,
    raisedAmount: 44000,
    registrationNumber: "SCA008"
  },
  {
    name: "Arts for Community",
    description: "Promoting arts education and cultural programs in underserved communities.",
    category: "Arts & Culture",
    contactEmail: "arts@artsforcom.org",
    contactPhone: "+1-555-0109",
    address: {
      street: "369 Creative Street",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      country: "USA"
    },
    website: "https://artsforcom.org",
    targetAmount: 70000,
    raisedAmount: 38000,
    registrationNumber: "AFC009"
  },
  {
    name: "Human Rights Watch",
    description: "Advocating for human rights and supporting victims of human rights violations.",
    category: "Human Rights",
    contactEmail: "rights@humanrights.org",
    contactPhone: "+1-555-0110",
    address: {
      street: "741 Justice Avenue",
      city: "Washington",
      state: "DC",
      zipCode: "20001",
      country: "USA"
    },
    website: "https://humanrights.org",
    targetAmount: 250000,
    raisedAmount: 156000,
    registrationNumber: "HRW010"
  }
];

const sampleAdmin = {
  username: "admin",
  password: "admin123456",
  email: "admin@charity-platform.com",
  role: "super_admin"
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/charity_donations');
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Admin.deleteMany({});
    await Charity.deleteMany({});
    await Donation.deleteMany({});
    await FoodSlot.deleteMany({});
    await Notification.deleteMany({});

    // Create admin user
    console.log('Creating admin user...');
    const admin = new Admin(sampleAdmin);
    await admin.save();
    console.log('Admin user created successfully');

    // Create charities
    console.log('Creating charities...');
    const createdCharities = await Charity.insertMany(sampleCharities);
    console.log(`${createdCharities.length} charities created successfully`);

    // Create sample donations
    console.log('Creating sample donations...');
    const sampleDonations = [];
    
    for (let i = 0; i < 50; i++) {
      const charity = createdCharities[Math.floor(Math.random() * createdCharities.length)];
      const donationTypes = ['money', 'food', 'clothes', 'books', 'toys', 'medicine'];
      const donationType = donationTypes[Math.floor(Math.random() * donationTypes.length)];
      
      const donation = {
        donorName: `Donor ${i + 1}`,
        donorEmail: `donor${i + 1}@example.com`,
        donorPhone: `+1-555-${String(i + 1).padStart(4, '0')}`,
        charityId: charity._id,
        donationType: donationType,
        amount: donationType === 'money' ? Math.floor(Math.random() * 5000) + 100 : 0,
        description: `Sample ${donationType} donation from Donor ${i + 1}`,
        quantity: donationType !== 'money' ? Math.floor(Math.random() * 10) + 1 : 1,
        unit: donationType === 'money' ? 'USD' : 'items',
        isAnonymous: Math.random() > 0.7,
        message: `Thank you for the great work! - Donor ${i + 1}`,
        status: ['pending', 'confirmed', 'delivered'][Math.floor(Math.random() * 3)],
        paymentMethod: donationType === 'money' ? ['card', 'bank_transfer', 'online'][Math.floor(Math.random() * 3)] : 'in_kind',
        paymentStatus: donationType === 'money' ? 'completed' : 'pending',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      };
      
      sampleDonations.push(donation);
    }
    
    await Donation.insertMany(sampleDonations);
    console.log(`${sampleDonations.length} donations created successfully`);

    // Create sample food slots
    console.log('Creating sample food slots...');
    const sampleFoodSlots = [];
    
    for (let i = 0; i < 20; i++) {
      const charity = createdCharities[Math.floor(Math.random() * createdCharities.length)];
      const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
      const mealType = mealTypes[Math.floor(Math.random() * mealTypes.length)];
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30)); // Random date within next 30 days
      
      const foodSlot = {
        charityId: charity._id,
        title: `Community ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} - ${charity.name}`,
        description: `Free ${mealType} for community members in need`,
        mealType: mealType,
        date: startDate,
        startTime: mealType === 'breakfast' ? '08:00' : mealType === 'lunch' ? '12:00' : mealType === 'dinner' ? '18:00' : '15:00',
        endTime: mealType === 'breakfast' ? '10:00' : mealType === 'lunch' ? '14:00' : mealType === 'dinner' ? '20:00' : '17:00',
        maxCapacity: Math.floor(Math.random() * 100) + 50,
        currentBookings: Math.floor(Math.random() * 30),
        servingLocation: {
          name: `${charity.name} Community Center`,
          address: charity.address
        },
        requirements: ['Valid ID', 'Proof of need'],
        menu: [
          {
            itemName: mealType === 'breakfast' ? 'Pancakes' : mealType === 'lunch' ? 'Sandwiches' : mealType === 'dinner' ? 'Pasta' : 'Cookies',
            description: `Fresh ${mealType === 'breakfast' ? 'pancakes with syrup' : mealType === 'lunch' ? 'turkey sandwiches' : mealType === 'dinner' ? 'pasta with sauce' : 'homemade cookies'}`,
            quantity: 100,
            unit: 'servings',
            isVegetarian: Math.random() > 0.5,
            isVegan: Math.random() > 0.7
          }
        ],
        donationGoal: Math.floor(Math.random() * 2000) + 500,
        raisedAmount: Math.floor(Math.random() * 1000),
        status: 'active',
        volunteers: [
          {
            name: `Volunteer ${i + 1}`,
            email: `volunteer${i + 1}@example.com`,
            phone: `+1-555-${String(i + 1000).padStart(4, '0')}`,
            role: 'Server'
          }
        ],
        specialInstructions: 'Please arrive 15 minutes early for setup',
        bookings: []
      };
      
      // Add some random bookings
      for (let j = 0; j < foodSlot.currentBookings; j++) {
        foodSlot.bookings.push({
          donorName: `Beneficiary ${j + 1}`,
          donorEmail: `beneficiary${j + 1}@example.com`,
          donorPhone: `+1-555-${String(j + 2000).padStart(4, '0')}`,
          numberOfPeople: Math.floor(Math.random() * 4) + 1,
          bookedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last 7 days
          status: 'confirmed'
        });
      }
      
      sampleFoodSlots.push(foodSlot);
    }
    
    await FoodSlot.insertMany(sampleFoodSlots);
    console.log(`${sampleFoodSlots.length} food slots created successfully`);

    // Create sample notifications
    console.log('Creating sample notifications...');
    const sampleNotifications = [];
    
    for (let i = 0; i < 15; i++) {
      const notification = {
        title: `Notification ${i + 1}`,
        message: `This is a sample notification message ${i + 1} for testing purposes.`,
        type: ['donation', 'food_slot', 'general', 'urgent'][Math.floor(Math.random() * 4)],
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        recipients: createdCharities.slice(0, Math.floor(Math.random() * 5) + 1).map(charity => ({
          charityId: charity._id,
          isRead: Math.random() > 0.5
        })),
        sender: 'System',
        isGlobal: Math.random() > 0.7,
        isSent: true,
        sentAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last 7 days
        deliveryMethod: ['in_app', 'email']
      };
      
      sampleNotifications.push(notification);
    }
    
    await Notification.insertMany(sampleNotifications);
    console.log(`${sampleNotifications.length} notifications created successfully`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Admin users: 1`);
    console.log(`- Charities: ${createdCharities.length}`);
    console.log(`- Donations: ${sampleDonations.length}`);
    console.log(`- Food slots: ${sampleFoodSlots.length}`);
    console.log(`- Notifications: ${sampleNotifications.length}`);
    
    console.log('\n🔐 Admin Login Credentials:');
    console.log(`Username: ${sampleAdmin.username}`);
    console.log(`Password: ${sampleAdmin.password}`);
    console.log(`Email: ${sampleAdmin.email}`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
}

// Run the seeding function
seedDatabase();