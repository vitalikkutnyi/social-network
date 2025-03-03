import React, { useState } from 'react';
import axios from 'axios';

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
            <div className="register-form">
              <h1>Реєстрація</h1>
              <form onSubmit={handleSubmit}>
                <div>
                  <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Ім'я користувача" />
                </div>
                <div>
                  <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Пароль"/>
                </div>
                <div>
                  <input type="password" id="password2" value={password2} onChange={(e) => setPassword2(e.target.value)} required placeholder="Підтвердження пароля"/>
                </div>
                <button type="submit">Зареєструватися</button>
              </form>
              {error && <div className="error">{error}</div>}
              {!error && message && <div className="success">{message}</div>}
            </div>
          );
} 

export default Register;