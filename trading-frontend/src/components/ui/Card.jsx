import React from 'react';

/**
 * A simple card container with optional header.
 */
function Card({ title, children }) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-4">
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <div>{children}</div>
    </div>
  );
}

export default Card;