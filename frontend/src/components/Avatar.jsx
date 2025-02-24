import PropTypes from 'prop-types';

export const Avatar = ({ name, isOnline }) => {
  return (
    <div className="relative">
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
        {name}
      </div>
      {isOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
};

Avatar.propTypes = {
  name: PropTypes.string.isRequired,
  isOnline: PropTypes.bool
};