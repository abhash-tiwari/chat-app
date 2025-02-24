import PropTypes from 'prop-types';

export const Button = ({ variant = 'primary', children, ...props }) => {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-md font-medium ${
        variant === 'primary'
          ? 'bg-[#6B7280] text-white hover:bg-[#4B5563]'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary']),
  children: PropTypes.node.isRequired
};