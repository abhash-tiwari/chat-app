import PropTypes from 'prop-types';

export const Input = ({ error, prefix, ...props }) => {
    return (
      <div className="space-y-1">
        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              {prefix}
            </div>
          )}
          <input
            {...props}
            className={`w-full px-4 ${prefix ? 'pl-10' : 'pl-4'} py-2 rounded-md border ${
              error ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  };

Input.propTypes = {
  error: PropTypes.string
};
