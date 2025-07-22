# Charity Donations Platform - MERN Stack

A comprehensive charity donations platform built with MongoDB, Express.js, React.js, and Node.js. The platform enables admin management of charities, donation tracking, food slot scheduling with time-based booking, and real-time notifications.

## 🌟 Features

### Admin Features
- **Admin Dashboard**: Comprehensive analytics and reporting
- **Charity Management**: Create, update, and manage 10 charity organizations
- **Donation Tracking**: Monitor all donations with status management
- **Food Slot Management**: Time-based food donation scheduling with menu management
- **Real-time Notifications**: Automatic notifications sent to all charities
- **Reports & Analytics**: Bootstrap-powered reporting with charts and data visualization
- **Secure Authentication**: JWT-based admin login system

### Public Features (No Login Required)
- **Browse Charities**: View all active charities with filtering and search
- **Make Donations**: Donate money or items to any charity without registration
- **Food Slot Booking**: Book time slots for food donations with capacity management
- **Real-time Updates**: Live updates on donation goals and food slot availability

### Technical Features
- **Beautiful UI**: Modern design with Bootstrap and custom color combinations
- **Responsive Design**: Mobile-friendly interface
- **Real-time Notifications**: Socket.IO integration for live updates
- **File Uploads**: Image support for charities and donations
- **Email Notifications**: Automated email alerts
- **Data Validation**: Comprehensive form validation
- **Error Handling**: Robust error management
- **Security**: Helmet.js security headers and input sanitization

## 🎨 Color Scheme & Design

The platform features a modern, professional design with a carefully selected color palette:

- **Primary**: Blue gradient (#2563eb to #1d4ed8)
- **Secondary**: Green (#10b981 to #059669) 
- **Accent**: Amber (#f59e0b to #d97706)
- **Background**: Light gray (#f8fafc)
- **Cards**: Clean white with subtle shadows

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Socket.IO** - Real-time communication
- **Multer** - File uploads
- **Nodemailer** - Email notifications
- **Helmet** - Security headers

### Frontend
- **React.js** - UI framework
- **TypeScript** - Type safety
- **Bootstrap** - CSS framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **React Toastify** - Notifications
- **FontAwesome** - Icons

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd charity-donations-platform
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/charity_donations
JWT_SECRET=charity_platform_secret_key_2024
NODE_ENV=development

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Client URL
CLIENT_URL=http://localhost:3000
```

### 5. Start MongoDB
```bash
# On Windows
net start mongodb

# On macOS (with Homebrew)
brew services start mongodb/brew/mongodb-community

# On Linux
sudo systemctl start mongod
```

### 6. Seed the Database
```bash
node scripts/seedDatabase.js
```

This will create:
- **1 Admin User**: Username: `admin`, Password: `admin123`
- **10 Charity Organizations** across different categories
- **Sample food slots** for food-related charities

### 7. Start the Application

#### Development Mode (Concurrent)
```bash
npm run dev
```
This starts both backend (port 5000) and frontend (port 3000) concurrently.

#### Separate Terminals
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

## 🌐 Access the Application

- **Public Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin/login
- **Backend API**: http://localhost:5000/api

### Admin Login Credentials
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@charityplatform.com`

## 📱 Usage Guide

### For Donors (Public Users)
1. **Browse Charities**: Visit the homepage to see all active charities
2. **Make Donations**: Click "Donate" on any charity - no login required
3. **Book Food Slots**: Browse available food slots and book time slots
4. **View Progress**: See real-time donation progress and goals

### For Administrators
1. **Login**: Access `/admin/login` with admin credentials
2. **Dashboard**: View comprehensive analytics and statistics
3. **Manage Charities**: Add, edit, or deactivate charity organizations
4. **Track Donations**: Monitor all donations and update statuses
5. **Manage Food Slots**: Create time-based food donation schedules
6. **Send Notifications**: Broadcast updates to all charities
7. **Generate Reports**: Export data and view analytics

## 🗂️ Project Structure

```
charity-donations-platform/
├── client/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React contexts
│   │   ├── types/          # TypeScript types
│   │   ├── config/         # API configuration
│   │   └── App.tsx         # Main app component
│   └── package.json
├── models/                 # MongoDB models
│   ├── Admin.js
│   ├── Charity.js
│   ├── Donation.js
│   ├── FoodSlot.js
│   └── Notification.js
├── routes/                 # Express routes
│   ├── auth.js
│   ├── charities.js
│   ├── donations.js
│   ├── foodSlots.js
│   ├── notifications.js
│   └── reports.js
├── middleware/             # Custom middleware
├── scripts/               # Utility scripts
│   └── seedDatabase.js
├── uploads/               # File uploads
├── server.js             # Main server file
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Admin registration
- `GET /api/auth/me` - Get current admin

### Charities
- `GET /api/charities` - List all charities
- `POST /api/charities` - Create charity (Admin)
- `PUT /api/charities/:id` - Update charity (Admin)
- `DELETE /api/charities/:id` - Delete charity (Admin)

### Donations
- `GET /api/donations` - List donations (Admin)
- `POST /api/donations` - Create donation (Public)
- `PUT /api/donations/:id/status` - Update status (Admin)

### Food Slots
- `GET /api/food-slots` - List food slots
- `POST /api/food-slots` - Create slot (Admin)
- `POST /api/food-slots/:id/book` - Book slot (Public)

### Reports
- `GET /api/reports/dashboard` - Dashboard stats (Admin)
- `GET /api/reports/donations` - Donation reports (Admin)
- `GET /api/reports/export/donations` - Export data (Admin)

## 🎯 Key Features Explained

### 1. **No-Login Donations**
Users can donate without creating accounts, reducing friction and encouraging more donations.

### 2. **Time-Based Food Slots**
Charities can create scheduled food donation events with:
- Date and time slots
- Capacity management
- Menu planning
- Booking system

### 3. **Real-Time Notifications**
Using Socket.IO for instant updates:
- New donation alerts
- Food slot bookings
- Charity status changes

### 4. **Comprehensive Admin Panel**
Full-featured dashboard with:
- Analytics and reporting
- Charity management
- Donation tracking
- User notifications

### 5. **Bootstrap Integration**
Professional UI with:
- Responsive design
- Modern components
- Custom color schemes
- Interactive charts

## 🔒 Security Features

- **JWT Authentication** for admin access
- **Input validation** and sanitization
- **File upload restrictions**
- **CORS configuration**
- **Helmet.js security headers**
- **Password hashing** with bcrypt

## 📊 Reporting & Analytics

The platform includes comprehensive reporting with:
- **Dashboard Overview**: Key metrics and statistics
- **Donation Reports**: Detailed donation analysis
- **Charity Performance**: Individual charity metrics
- **Food Slot Analytics**: Booking and capacity analysis
- **Export Functionality**: CSV data export
- **Interactive Charts**: Visual data representation

## 🔄 Real-Time Features

- **Live Donation Updates**: Instant goal progress updates
- **Food Slot Availability**: Real-time capacity tracking
- **Admin Notifications**: Immediate alerts for new activities
- **Status Changes**: Live updates when donation statuses change

## 🧪 Testing

### Manual Testing
1. **Admin Functionality**: Login and test all admin features
2. **Public Donations**: Test donation flow without login
3. **Food Slot Booking**: Book slots and verify capacity updates
4. **Notifications**: Test real-time notification delivery

### API Testing
Use tools like Postman to test API endpoints:
```bash
# Example: Get all charities
GET http://localhost:5000/api/charities

# Example: Admin login
POST http://localhost:5000/api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd client
npm run build
cd ..

# Start production server
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=your_production_client_url
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
1. Check the issue tracker
2. Review the documentation
3. Contact the development team

## 🔮 Future Enhancements

- **Payment Gateway Integration**: Stripe/PayPal integration
- **Mobile App**: React Native mobile application
- **Volunteer Management**: Volunteer registration and scheduling
- **Event Management**: Full event planning and management
- **Multi-language Support**: Internationalization
- **Advanced Analytics**: More detailed reporting and insights
- **Social Media Integration**: Share donations and achievements
- **Recurring Donations**: Subscription-based donation system

---

**Built with ❤️ using the MERN stack for charity and community support.**