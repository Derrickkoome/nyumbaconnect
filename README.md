# NyumbaConnect

A modern web application for landlords and tenants to manage rental properties, track payments, and communicate effectively.

## 🚀 Live Demo

**[View Live Application](https://nyumbaconnect-36c88.web.app)**

## 📱 Features

- ✅ **Authentication** - Secure login with email/password and Google Sign-in
- ✅ **Properties Management** - Add, edit, and track rental properties
- ✅ **Tenants Management** - Manage tenant information and assignments
- ✅ **Dashboard** - Real-time statistics and occupancy tracking
- 🚧 **Payments System** - Coming soon
- 🚧 **Receipt Generation** - Coming soon

## 🛠️ Tech Stack

- React 18 + Vite
- Tailwind CSS v4
- Firebase (Authentication, Firestore, Hosting)
- React Router v6
- GitHub Actions (CI/CD)

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- Firebase account
- Git

### Local Development
```bash
# Clone the repository
git clone https://github.com/Derrickkoome/nyumbaconnect.git
cd nyumbaconnect

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env
# Add your Firebase credentials to .env

# Run development server
npm run dev
```

### Building for Production
```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

### Deployment

The app automatically deploys to Firebase Hosting via GitHub Actions on every push to the `main` branch.

Manual deployment:
```bash
firebase deploy --only hosting
```

## 📈 Development Progress

**Completed:**
- ✅ Project Setup & Configuration
- ✅ Firebase Integration
- ✅ Authentication System (Email/Password + Google)
- ✅ Properties CRUD Operations
- ✅ Tenants CRUD Operations
- ✅ Dashboard with Statistics
- ✅ Responsive Design
- ✅ CI/CD with GitHub Actions

**In Progress:**
- 🚧 Payments Tracking System

**Upcoming:**
- 📋 Receipt Generation
- 🔔 Notifications & Reminders
- 📊 Reports & Analytics
- 👤 User Roles (Landlord/Tenant views)
- 💳 M-Pesa Integration

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

MIT

## 👨‍💻 Author

**Derrick Koome**
- GitHub: [@Derrickkoome](https://github.com/Derrickkoome)

---

**Built for the Kenyan rental market**