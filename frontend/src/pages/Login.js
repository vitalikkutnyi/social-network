import React, { useState } from 'react';
import axios from 'axios';
import AuthForm from '../components/AuthForm';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await axios.post('http://localhost:8000/login/', formData, {
              headers: {
                'Content-Type': 'multipart/form-data', 
              },
            });
      
            if (response.data.message) {
              setMessage(response.data.message);
              setError('');
            } 
        } catch (error) {
            if (error.response && error.response.data.error) {
                setError(error.response.data.error);
                setMessage('');
            } else {
                setError('Сталася помилка при відправці запиту');
            }        
        }
    };
    
        return (
            <AuthForm 
            title="Авторизація"
            onSubmit={handleSubmit} 
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            error={error}
            message={message}
            buttonText="Увійти"/>
          );
} 

export default Login;