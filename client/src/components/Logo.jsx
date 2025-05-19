import React from 'react';
import './Logo.css';

const Logo = ({ show = true, height = 'auto', width = 'auto' }) => {
    if (!show) return null;
    
    return (
        <div className="logo-container">
            <img 
                src="/images/IMG_2067.png" 
                alt="Hajj Packages" 
                className="logo" 
                style={{ 
                    height: height || '50px',
                    width: width || 'auto',
                    display: 'block',
                    margin: '0 auto'
                }}
            />
        </div>
    );
};

export default Logo;