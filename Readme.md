# 🔐 Authentication System

## 🚀 Overview

This is a robust authentication system that supports both **SQL** and **NoSQL** databases. It provides secure user authentication, session management, and role-based access control.

## ✨ Features

- ✅ User registration and login
- 🔒 Secure password hashing
- 🔑 JWT-based authentication
- ⏳ Session management
- 👥 Role-based access control (RBAC)
- 📀 Support for both SQL and NoSQL databases

## 🛠️ Technologies Used

- **Backend:** [Specify the backend framework, e.g., Node.js, Express, Django, Flask]
- **Database:** 🗄️ SQL (MySQL/PostgreSQL) & NoSQL (MongoDB)
- **Authentication:** 🔑 JWT, bcrypt
- **Environment Management:** 🌍 dotenv

## 📥 Installation

### ✅ Prerequisites

Ensure you have the following installed:

- 🟢 Node.js (if using JavaScript/TypeScript)
- 🐍 Python (if using Django/Flask)
- 🛢️ MySQL/PostgreSQL (for SQL database)
- 🍃 MongoDB (for NoSQL database)
- 🖥️ Git

### ⚡ Steps to Run the Project

1️⃣ **Clone the Repository:**

```sh
git clone https://github.com/sanketsingh01/Authentication-system.git
cd Authentication-system
```

2️⃣ **Set Up Environment Variables:** Create a `.env` file and configure database connections, secret keys, and other credentials.

```env
DB_TYPE=SQL/NoSQL
SQL_DB_URI=your_sql_database_url
NOSQL_DB_URI=your_nosql_database_url
JWT_SECRET=your_secret_key
```

3️⃣ **Install Dependencies:**

```sh
npm install  # If using Node.js
pip install -r requirements.txt  # If using Python
```

4️⃣ **Run the Application:**

```sh
npm start  # For Node.js
python app.py  # For Python
```

5️⃣ **Access the API:** The authentication system runs on `http://localhost:PORT/` (Replace `PORT` with your configured port).

## 🔗 API Endpoints

| ⚡ Method | 🌐 Endpoint | 📝 Description        |
| --------- | ----------- | --------------------- |
| 📨 POST   | `/register` | 📝 User registration  |
| 🔑 POST   | `/login`    | 🔓 User login         |
| 👤 GET    | `/profile`  | 📄 Fetch user profile |
| 🚪 POST   | `/logout`   | 🔒 User logout        |

## 🤝 Contributing

🎯 Feel free to fork this repository, create a new branch, and submit a pull request with your changes.

## 📜 License

This project is licensed under the [MIT License](LICENSE).
