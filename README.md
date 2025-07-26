# E-Finance - Personal Finance Management System

A comprehensive personal finance management application built with React.js and Node.js, designed to help users track expenses, manage investments, and monitor transactions with intelligent features like receipt scanning and SIP calculations.

## 🌐 Live Demo

**Access the application:** [https://e-finance-lipu.onrender.com](https://e-finance-lipu.onrender.com)

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 💰 Expense Management
- **Add & Track Expenses**: Record expenses with categories, amounts, and dates
- **Receipt Scanner**: AI-powered receipt scanning for automatic expense entry
- **Category Management**: Organize expenses by customizable categories
- **Visual Analytics**: Interactive charts and graphs for expense analysis
- **Export/Import**: CSV file support for bulk data operations

### 📈 Investment Tracking
- **Portfolio Management**: Track various investment types and performance
- **SIP Calculator**: Built-in Systematic Investment Plan calculator
- **Investment Analytics**: Comprehensive charts and breakdowns
- **Performance Monitoring**: Track gains/losses over time
- **External Integration**: Links to Money Control for detailed market analysis

### 💳 Transaction Management
- **Transaction Logging**: Record credit and debit transactions
- **CSV Import/Export**: Bulk transaction management
- **Real-time Analytics**: Dynamic charts for transaction patterns
- **Advanced Filtering**: Filter by type, date, and amount ranges
- **Inline Editing**: Quick edit transactions directly in tables

### 🎨 User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme**: Customizable interface themes
- **Real-time Updates**: Live data synchronization
- **Intuitive Navigation**: Clean and user-friendly interface
- **Data Visualization**: Interactive charts powered by Chart.js

## 🛠 Technology Stack

### Frontend
- **React.js** - Modern UI library for building interactive interfaces
- **Vite** - Fast build tool and development server
- **Chart.js** - Data visualization and charting library
- **CSS3** - Custom styling with responsive design
- **Clerk** - Authentication and user management

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling
- **RESTful APIs** - Standard API architecture

### Development Tools
- **ESLint** - Code linting and quality assurance
- **Git** - Version control system
- **VS Code** - Recommended development environment

## 📁 Project Structure

```
Efinance/
├── efinance backend/           # Backend server code
│   ├── config/                # Database and configuration files
│   ├── controllers/           # API route controllers
│   ├── models/               # Database models (User, Expense, Investment, Transaction)
│   ├── routes/               # API route definitions
│   ├── package.json          # Backend dependencies
│   └── server.js             # Main server file
│
├── efinance frontend/         # Frontend React application
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── components/       # Reusable React components
│   │   ├── pages/           # Main page components
│   │   ├── services/        # API services and utilities
│   │   ├── Styles/          # CSS styling files
│   │   └── assets/          # Images and static resources
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
│
├── DEPLOYMENT_CHECKLIST.md   # Deployment guidelines
├── FINAL_CONFIGURATION.md    # Configuration documentation
└── README.md                 # Project documentation
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup
1. **Navigate to backend directory:**
   ```bash
   cd "efinance backend"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Create a `.env` file in the backend directory
   - Add database connection string and other configurations

4. **Start the server:**
   ```bash
   npm start
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup
1. **Navigate to frontend directory:**
   ```bash
   cd "efinance frontend"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Application will run on `http://localhost:3000`

## 📖 Usage

### Getting Started
1. **Register/Login**: Create an account or sign in using Clerk authentication
2. **Dashboard**: Access the main dashboard for an overview of your finances
3. **Add Data**: Start by adding expenses, investments, or transactions
4. **Analyze**: Use the built-in charts and analytics to understand your financial patterns

### Key Features Guide

#### Expense Management
- Click "Add Expense" to record new expenses
- Use the receipt scanner for automatic data entry
- Filter and search through your expense history
- Export data for external analysis

#### Investment Tracking
- Add investments with purchase details
- Use the SIP calculator for investment planning
- Monitor portfolio performance with visual charts
- Access external market data through Money Control integration

#### Transaction Management
- Record both credit and debit transactions
- Import bulk transactions via CSV
- Edit transactions inline for quick updates
- Filter transactions by various criteria

## 🔌 API Endpoints

### Expenses
- `GET /api/expenses` - Retrieve all expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Investments
- `GET /api/investments` - Retrieve all investments
- `POST /api/investments` - Create new investment
- `PUT /api/investments/:id` - Update investment
- `DELETE /api/investments/:id` - Delete investment

### Transactions
- `GET /api/transactions` - Retrieve all transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

## 🤝 Contributing

We welcome contributions to improve E-Finance! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/new-feature`
3. **Commit changes:** `git commit -am 'Add new feature'`
4. **Push to branch:** `git push origin feature/new-feature`
5. **Submit a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Write clear commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chart.js for excellent data visualization
- Clerk for seamless authentication
- React community for continuous inspiration
- All contributors and users of E-Finance

## 📞 Support

For support, bug reports, or feature requests:
- Create an issue on GitHub
- Contact the development team
- Check the documentation for common solutions

---

**E-Finance** - Empowering your financial journey with intelligent management tools.

*Last updated: July 2025*
