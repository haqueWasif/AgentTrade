import React from 'react';

/**
 * A reusable button component with basic variants.
 * @param {string} variant - "primary", "outline" or "danger".
 * @param {string} type - HTML button type.
 * @param {children} children - Button label.
 */
function Button({ variant = 'primary', type = 'button', children, ...props }) {
  let base = 'px-4 py-2 font-medium rounded transition-colors';
  let colors;
  switch (variant) {
    case 'outline':
      colors = 'border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white';
      break;
    case 'danger':
      colors = 'bg-red-600 text-white hover:bg-red-700';
      break;
    default:
      // primary
      colors = 'bg-blue-600 text-white hover:bg-blue-700';
  }
  return (
    <button type={type} className={`${base} ${colors}`} {...props}>
      {children}
    </button>
  );
}

export default Button;