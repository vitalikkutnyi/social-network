import React, { useState } from 'react';
import axios from 'axios';
import AuthForm from '../components/AuthForm';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('password2', password2);

        try {
            const response = await axios.post('http://localhost:8000/register/', formData, {
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
            title="Реєстрація"
            onSubmit={handleSubmit} 
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            password2={password2}
            setPassword2={setPassword2}
            error={error}
            message={message}
            buttonText="Зареєструватися"/>
          );
} 

export default Register;