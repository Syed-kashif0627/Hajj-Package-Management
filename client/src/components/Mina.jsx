import React from 'react';


const Mina = ({ height, width }) => {
  return (
    <img 
      src="/images/hajj-mina.jpeg" 
      alt="Mina tents" 
      style={{ height, width, maxWidth: '100%', objectFit: 'cover' }}
      className="rounded shadow-lg"
    />
  );
};

export default Mina;