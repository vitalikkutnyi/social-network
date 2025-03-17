import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            username,
            password,
            password2
        };

        try {
            const response = await axios.post('http://localhost:8000/register/', data, {
              headers: {
                'Content-Type': 'application/json', 
              },
            });
      
            if (response.data.message) {
              setMessage(response.data.message);
              setError('');
              localStorage.setItem('access_token', response.data.access_token);
              localStorage.setItem('refresh_token', response.data.refresh_token);
              navigate(`/profile/`);
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
            buttonText="Зареєструватися"
            anotherContent={(
                <>
                    <p>Вже зареєстровані?</p>
                    <button type="button" onClick={() => navigate('/login')}>Увійти</button>
                </>
            )}
        />
    );
}

export default Register;
