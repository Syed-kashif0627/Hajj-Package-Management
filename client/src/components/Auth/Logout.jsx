import React from 'react';
import { useHistory } from 'react-router-dom';
import '../../styles/Auth.css'; // Assuming you have a specific CSS file for Auth components

const Logout = () => {
    const history = useHistory();

    const handleLogout = () => {
        // Clear user session (this could be a call to an API to log out)
        localStorage.removeItem('user'); // Example of clearing user data from local storage
        history.push('/'); // Redirect to home page after logout
    };

    return (
        <div className="logout-container">
            <h2>Logout</h2>
            <p>Are you sure you want to logout?</p>
            <button onClick={handleLogout} className="btn btn-primary">Logout</button>
        </div>
    );
};

export default Logout;