# Hajj Package App

This is a full-fledged web application built using React for the client-side and Node.js with Express for the server-side. The application provides user authentication features including signup, login, and logout functionalities, with user data stored in a MongoDB database named "Hajj_package_DB".

## Project Structure

The project is organized into two main directories: `client` and `server`.

### Client

- **public/**: Contains static files.
  - `index.html`: The main HTML file for the React application.
  - `manifest.json`: Metadata about the web application.

- **src/**: Contains the source code for the React application.
  - **components/**: Contains reusable components.
    - **Auth/**: Contains authentication-related components.
      - `Login.jsx`: Component for user login.
      - `Signup.jsx`: Component for user signup.
      - `Logout.jsx`: Component for user logout.
    - `Logo.jsx`: Component for displaying the company logo.
  - **pages/**: Contains page components.
    - `Home.jsx`: Landing page of the application.
    - `Dashboard.jsx`: User dashboard after logging in.
  - **styles/**: Contains CSS files for styling.
    - `Auth.css`: Styles for authentication components.
    - `Home.css`: Styles for the home page.
    - `App.css`: Global styles for the application.
  - `App.jsx`: Main application component that sets up routing.
  - `index.js`: Entry point for the React application.

- `package.json`: Configuration file for the client-side application.

### Server

- **config/**: Contains configuration files.
  - `db.js`: Configuration for connecting to the MongoDB database.
- **models/**: Contains Mongoose models.
  - `User.js`: Defines the schema for user data.
- **routes/**: Contains route definitions.
  - `auth.js`: Authentication routes for signup and login.
- `server.js`: Entry point for the server application.
- `package.json`: Configuration file for the server-side application.

## Technologies Used

- **Frontend**: React, Bootstrap, HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: MongoDB

## Getting Started

1. Clone the repository.
2. Navigate to the `client` directory and run `npm install` to install client-side dependencies.
3. Navigate to the `server` directory and run `npm install` to install server-side dependencies.
4. Set up your MongoDB database and update the connection string in `server/config/db.js`.
5. Start the server by running `node server.js` in the `server` directory.
6. Start the client by running `npm start` in the `client` directory.

## Deployment

The application can be deployed using platforms like Heroku, Vercel, or Netlify for the client-side, and a suitable cloud service for the server-side. Make sure to configure environment variables for production settings.

## License

This project is licensed under the MIT License.