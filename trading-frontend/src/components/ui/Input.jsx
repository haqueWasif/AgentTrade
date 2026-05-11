import React from 'react';

/**
 * A styled input component.
 * Accepts all regular input props.
 */
function Input({ ...props }) {
  return (
    <input
      className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
      {...props}
    />
  );
}

export default Input;