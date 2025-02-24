import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { api } from '../utils/api';
import logo from '../assets/image 66.png'

export const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.login(formData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/chat');
    } catch (error) {
      setErrors({ submit: 'Login failed. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#8BABD8] flex items-center justify-center">
      <div className="w-[400px] bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-8">
          <img src={logo} alt="" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />
          <Input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
          />
          <Button type="submit" className="w-full">
            Login
          </Button>
          {errors.submit && (
            <p className="text-sm text-red-500 text-center">{errors.submit}</p>
          )}
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-blue-500 hover:text-blue-600"
            >
              Sign up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};