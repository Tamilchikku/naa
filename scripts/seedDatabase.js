const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Admin = require('../models/Admin');
const Charity = require('../models/Charity');
const FoodSlot = require('../models/FoodSlot');

// Sample data
const adminData = {
  username: 'admin',
  email: 'admin@charityplatform.com',
  password: 'admin123', // Will be hashed by the model
  role: 'super_admin'
};

const charitiesData = [
  {
    name: 'Hope Foundation',
    description: 'Dedicated to providing education and healthcare to underprivileged children worldwide.',
    category: 'Education',
    contactEmail: 'contact@hopefoundation.org',
    contactPhone: '+1-555-0101',
    address: {
      street: '123 Hope Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    website: 'https://hopefoundation.org',
    targetAmount: 500000,
    raisedAmount: 125000,
    isActive: true,
    socialMedia: {
      facebook: 'https://facebook.com/hopefoundation',
      twitter: 'https://twitter.com/hopefoundation'
    }
  },
  {
    name: 'Green Earth Initiative',
    description: 'Working towards environmental conservation and sustainable development.',
    category: 'Environment',
    contactEmail: 'info@greenearthinitiative.org',
    contactPhone: '+1-555-0102',
    address: {
      street: '456 Eco Avenue',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA'
    },
    website: 'https://greenearthinitiative.org',
    targetAmount: 750000,
    raisedAmount: 300000,
    isActive: true,
    socialMedia: {
      facebook: 'https://facebook.com/greenearthinitiative',
      instagram: 'https://instagram.com/greenearthinitiative'
    }
  },
  {
    name: 'Healing Hearts Medical',
    description: 'Providing free medical care and support to communities in need.',
    category: 'Healthcare',
    contactEmail: 'support@healinghearts.org',
    contactPhone: '+1-555-0103',
    address: {
      street: '789 Care Drive',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    website: 'https://healinghearts.org',
    targetAmount: 1000000,
    raisedAmount: 450000,
    isActive: true
  },
  {
    name: 'Feed the Hungry',
    description: 'Fighting hunger and food insecurity in local communities.',
    category: 'Food & Hunger',
    contactEmail: 'help@feedthehungry.org',
    contactPhone: '+1-555-0104',
    address: {
      street: '321 Nourish Lane',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      country: 'USA'
    },
    website: 'https://feedthehungry.org',
    targetAmount: 300000,
    raisedAmount: 180000,
    isActive: true
  },
  {
    name: 'Animal Rescue Alliance',
    description: 'Rescuing and caring for abandoned and abused animals.',
    category: 'Animals',
    contactEmail: 'rescue@animalalliance.org',
    contactPhone: '+1-555-0105',
    address: {
      street: '654 Paw Street',
      city: 'Denver',
      state: 'CO',
      zipCode: '80201',
      country: 'USA'
    },
    website: 'https://animalalliance.org',
    targetAmount: 400000,
    raisedAmount: 220000,
    isActive: true
  },
  {
    name: 'Shelter for All',
    description: 'Providing safe housing and support for homeless individuals and families.',
    category: 'Poverty',
    contactEmail: 'shelter@shelterforall.org',
    contactPhone: '+1-555-0106',
    address: {
      street: '987 Shelter Road',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'USA'
    },
    website: 'https://shelterforall.org',
    targetAmount: 600000,
    raisedAmount: 275000,
    isActive: true
  },
  {
    name: 'Emergency Response Team',
    description: 'Providing rapid disaster relief and emergency assistance.',
    category: 'Disaster Relief',
    contactEmail: 'emergency@responseTeam.org',
    contactPhone: '+1-555-0107',
    address: {
      street: '159 Response Boulevard',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA'
    },
    website: 'https://emergencyresponse.org',
    targetAmount: 800000,
    raisedAmount: 520000,
    isActive: true
  },
  {
    name: 'Rights for All',
    description: 'Advocating for human rights and social justice worldwide.',
    category: 'Human Rights',
    contactEmail: 'justice@rightsforall.org',
    contactPhone: '+1-555-0108',
    address: {
      street: '753 Justice Avenue',
      city: 'Washington',
      state: 'DC',
      zipCode: '20001',
      country: 'USA'
    },
    website: 'https://rightsforall.org',
    targetAmount: 450000,
    raisedAmount: 190000,
    isActive: true
  },
  {
    name: 'Arts & Culture Society',
    description: 'Promoting arts education and cultural preservation in communities.',
    category: 'Arts & Culture',
    contactEmail: 'culture@artsociety.org',
    contactPhone: '+1-555-0109',
    address: {
      street: '852 Culture Street',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA'
    },
    website: 'https://artsociety.org',
    targetAmount: 250000,
    raisedAmount: 95000,
    isActive: true
  },
  {
    name: 'Future Leaders Foundation',
    description: 'Empowering young people through leadership development and mentorship.',
    category: 'Education',
    contactEmail: 'leaders@futureleaders.org',
    contactPhone: '+1-555-0110',
    address: {
      street: '147 Leadership Drive',
      city: 'Boston',
      state: 'MA',
      zipCode: '02101',
      country: 'USA'
    },
    website: 'https://futureleaders.org',
    targetAmount: 350000,
    raisedAmount: 165000,
    isActive: true
  }
];

// Sample food slots
const createFoodSlots = (charities) => {
  const foodSlots = [];
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const today = new Date();
  
  // Create food slots for charities that deal with food/hunger
  const foodCharities = charities.filter(charity => 
    charity.category === 'Food & Hunger' || charity.category === 'Poverty'
  );

  foodCharities.forEach(charity => {
    for (let i = 0; i < 5; i++) {
      const slotDate = new Date(today);
      slotDate.setDate(today.getDate() + i + 1);
      
      const mealType = mealTypes[i % mealTypes.length];
      const startTime = mealType === 'breakfast' ? '08:00' : 
                      mealType === 'lunch' ? '12:00' : 
                      mealType === 'dinner' ? '18:00' : '15:00';
      const endTime = mealType === 'breakfast' ? '10:00' : 
                     mealType === 'lunch' ? '14:00' : 
                     mealType === 'dinner' ? '20:00' : '17:00';

      foodSlots.push({
        charityId: charity._id,
        title: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Service`,
        description: `Free ${mealType} for community members in need. Join us for a nutritious meal and community support.`,
        mealType: mealType,
        date: slotDate,
        startTime: startTime,
        endTime: endTime,
        maxCapacity: Math.floor(Math.random() * 100) + 50,
        currentBookings: Math.floor(Math.random() * 30),
        servingLocation: {
          name: `${charity.name} Community Center`,
          address: charity.address
        },
        requirements: ['ID required', 'No age restrictions'],
        menu: [
          {
            itemName: mealType === 'breakfast' ? 'Pancakes & Coffee' : 
                     mealType === 'lunch' ? 'Soup & Sandwich' : 
                     mealType === 'dinner' ? 'Rice & Vegetables' : 'Fruit & Juice',
            description: 'Fresh and nutritious meal',
            quantity: 1,
            unit: 'serving',
            isVegetarian: Math.random() > 0.5,
            isVegan: Math.random() > 0.7,
            allergens: []
          }
        ],
        donationGoal: Math.floor(Math.random() * 5000) + 1000,
        raisedAmount: Math.floor(Math.random() * 2000),
        status: 'active',
        isRecurring: Math.random() > 0.7,
        recurringDays: ['monday', 'wednesday', 'friday'],
        volunteers: [
          {
            name: 'John Volunteer',
            email: 'john@volunteer.com',
            role: 'Coordinator'
          }
        ],
        specialInstructions: 'Please arrive 15 minutes early for check-in.',
        bookings: []
      });
    }
  });

  return foodSlots;
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/charity_donations');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Admin.deleteMany({});
    await Charity.deleteMany({});
    await FoodSlot.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = new Admin(adminData);
    await admin.save();
    console.log('Admin user created');

    // Create charities
    const createdCharities = [];
    for (const charityData of charitiesData) {
      const charity = new Charity(charityData);
      const savedCharity = await charity.save();
      createdCharities.push(savedCharity);
    }
    console.log('10 charities created');

    // Create food slots
    const foodSlotsData = createFoodSlots(createdCharities);
    await FoodSlot.insertMany(foodSlotsData);
    console.log(`${foodSlotsData.length} food slots created`);

    console.log('\n=== Seed Data Summary ===');
    console.log('Admin Login Credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@charityplatform.com');
    console.log('\nTotal Charities: 10');
    console.log('Total Food Slots:', foodSlotsData.length);
    console.log('\nDatabase seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;