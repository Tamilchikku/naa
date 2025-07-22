# 🌟 Charity Donations Platform - Application Guide

## 🎯 Overview

This is a comprehensive MERN (MongoDB, Express.js, React.js, Node.js) stack application for managing charity donations with an admin panel. The platform allows charities to receive donations, manage food distribution slots, and track donor engagement.

## 🏃‍♂️ Quick Start

### Prerequisites Met ✅
- Node.js (v22.16.0) - Installed
- MongoDB (v7.0.22) - Installed and Running
- NPM packages - Installed

### Application Status 🟢
- **Backend Server**: Running on `http://localhost:5000`
- **Frontend App**: Running on `http://localhost:3000`
- **Database**: Populated with sample data

## 🔐 Admin Access

**Login Credentials:**
- **Username**: `admin`
- **Password**: `admin123456`
- **Email**: `admin@charity-platform.com`

**Admin Login URL**: `http://localhost:3000/admin/login`

## 🏠 Application Structure

### Public Interface (No Login Required)
- **Home Page**: `http://localhost:3000/`
- **View Charities**: `http://localhost:3000/charities`
- **Make Donations**: `http://localhost:3000/donate`
- **Food Slots**: `http://localhost:3000/food-slots`
- **Book Food Slots**: `http://localhost:3000/book-slot/:id`

### Admin Interface (Login Required)
- **Dashboard**: `http://localhost:3000/admin/dashboard`
- **Manage Charities**: `http://localhost:3000/admin/charities`
- **View Donations**: `http://localhost:3000/admin/donations`
- **Manage Food Slots**: `http://localhost:3000/admin/food-slots`
- **Notifications**: `http://localhost:3000/admin/notifications`
- **Reports**: `http://localhost:3000/admin/reports`

## 📊 Sample Data Included

The database has been populated with:
- **10 Charities** across different categories (Education, Healthcare, Environment, etc.)
- **50 Sample Donations** (money, food, clothes, books, toys, medicine)
- **20 Food Distribution Slots** with bookings
- **15 Notifications** for testing the notification system
- **1 Admin User** for accessing the admin panel

## 🎨 Key Features

### For Donors (Public)
1. **Browse Charities**: View all active charities with details
2. **Make Donations**: Donate money or items without registration
3. **Food Slots**: View and book meal distribution slots
4. **Anonymous Donations**: Option to donate anonymously
5. **Upload Images**: Attach photos to donations

### For Admins
1. **Charity Management**: Add, edit, and manage charity organizations
2. **Donation Tracking**: View all donations, update status
3. **Food Slot Management**: Create and manage meal distribution slots
4. **Real-time Notifications**: Receive instant notifications via Socket.IO
5. **Reporting**: View donation statistics and analytics
6. **File Uploads**: Manage charity logos and donation images

## 🔄 Real-time Features

- **Live Notifications**: Admins receive real-time notifications when donations are made
- **Socket.IO Integration**: Real-time updates for new donations and food slot bookings
- **Auto-updates**: Charity raised amounts update automatically

## 🌈 UI/UX Features

- **Modern Bootstrap Design**: Responsive, mobile-friendly interface
- **Custom Color Scheme**: Professional charity platform styling
- **Toast Notifications**: User-friendly feedback messages
- **Form Validations**: Comprehensive input validation
- **Image Upload**: Drag-and-drop file uploads

## 🗂️ Categories Supported

1. **Education** - Schools, literacy programs
2. **Healthcare** - Medical aid, hospitals
3. **Environment** - Conservation, sustainability
4. **Food & Hunger** - Meal programs, food banks
5. **Animals** - Animal rescue, shelters
6. **Disaster Relief** - Emergency response
7. **Human Rights** - Advocacy, legal aid
8. **Arts & Culture** - Cultural preservation, arts education
9. **Poverty** - Housing, poverty alleviation
10. **Other** - Miscellaneous causes

## 📱 API Endpoints

### Public APIs (No Authentication)
- `GET /api/charities` - List all charities
- `GET /api/charities/:id` - Get charity details
- `POST /api/donations` - Create donation
- `GET /api/food-slots` - List food slots
- `POST /api/food-slots/:id/book` - Book food slot

### Admin APIs (Authentication Required)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current admin
- `POST /api/charities` - Create charity
- `PUT /api/charities/:id` - Update charity
- `GET /api/donations` - List all donations
- `PUT /api/donations/:id/status` - Update donation status
- `POST /api/food-slots` - Create food slot
- `GET /api/reports/*` - Various reports

## 🛠️ Development Commands

```bash
# Start both frontend and backend
npm run dev

# Start only backend
npm run server

# Start only frontend
npm run client

# Install frontend dependencies
npm run install-client

# Build for production
npm run build

# Reseed database
node scripts/seedDatabase.js
```

## 💾 Database Schema

### Collections:
- **admins** - Admin user accounts
- **charities** - Charity organizations
- **donations** - Donation records
- **foodslots** - Food distribution slots
- **notifications** - System notifications

## 🔧 Configuration

### Environment Variables (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/charity_donations
JWT_SECRET=charity_platform_secret_key_2024
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Upload Directories
- `/uploads/logos/` - Charity logos
- `/uploads/donations/` - Donation images
- `/uploads/food-slots/` - Food slot images

## 🚀 Production Deployment

The application is ready for deployment with:
- Environment-based configuration
- Production build scripts
- Static file serving
- Security middleware (Helmet, CORS)
- Error handling

## 🎯 Testing the Application

### Test Donation Flow:
1. Visit `http://localhost:3000/charities`
2. Select a charity and click "Donate"
3. Fill out donation form
4. Check admin panel for notification

### Test Food Slot Booking:
1. Visit `http://localhost:3000/food-slots`
2. Select a food slot and book it
3. Check admin notifications

### Test Admin Features:
1. Login at `http://localhost:3000/admin/login`
2. Explore dashboard and reports
3. Create new charity or food slot
4. Manage donations and view analytics

## 🌟 Next Steps for Enhancement

1. **Payment Integration**: Add Stripe/PayPal for real payments
2. **Email Notifications**: Send email confirmations
3. **SMS Alerts**: Text message notifications
4. **Mobile App**: React Native companion app
5. **Advanced Analytics**: More detailed reporting
6. **Multi-language**: Internationalization support

## 🆘 Troubleshooting

### If MongoDB is not running:
```bash
sudo -u mongodb mongod --dbpath /data/db --bind_ip 127.0.0.1 &
```

### If frontend won't start:
```bash
cd client && npm install && npm start
```

### If backend won't start:
```bash
npm install && npm run server
```

### Reset Database:
```bash
node scripts/seedDatabase.js
```

---

**Happy Coding! 🎉** The application is now fully functional and ready for use!