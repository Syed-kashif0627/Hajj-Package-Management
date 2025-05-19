# Hajj Package App

## Overview
The Hajj Package App is a full-fledged web application designed to facilitate user authentication and provide information related to Hajj packages. The application is built using React for the frontend and Node.js with Express for the backend, utilizing MongoDB as the database to store user information.

## Technologies Used
- **Frontend:**
  - React
  - Bootstrap for responsiveness
  - HTML, CSS, JavaScript

- **Backend:**
  - Node.js
  - Express
  - MongoDB

## Features
- User authentication with signup, login, and logout functionality.
- Responsive design using Bootstrap.
- User-friendly interface with a clean layout.
- Secure storage of user credentials in a MongoDB database.

## Project Structure
```
hajj-package-app
├── client
│   ├── public
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src
│   │   ├── components
│   │   │   ├── Auth
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Signup.jsx
│   │   │   │   └── Logout.jsx
│   │   │   └── Logo.jsx
│   │   ├── pages
│   │   │   ├── Home.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── styles
│   │   │   ├── Auth.css
│   │   │   ├── Home.css
│   │   │   └── App.css
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── README.md
├── server
│   ├── config
│   │   └── db.js
│   ├── models
│   │   └── User.js
│   ├── routes
│   │   └── auth.js
│   ├── server.js
│   └── package.json
└── README.md
```

## Getting Started
1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd hajj-package-app
   ```

2. **Setup the client:**
   - Navigate to the client directory:
     ```
     cd client
     ```
   - Install dependencies:
     ```
     npm install
     ```
   - Start the client application:
     ```
     npm start
     ```

3. **Setup the server:**
   - Navigate to the server directory:
     ```
     cd server
     ```
   - Install dependencies:
     ```
     npm install
     ```
   - Start the server application:
     ```
     node server.js
     ```

## Database Configuration
The application uses MongoDB to store user data. Ensure that you have a MongoDB instance running and update the connection string in `server/config/db.js` to point to your MongoDB database named "Hajj_package_DB".

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.