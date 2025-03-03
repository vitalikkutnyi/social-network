import React, { useState } from 'react';

function AuthForm({ title, onSubmit, username, setUsername, password, setPassword, password2, setPassword2, error, message, buttonText }) {    
    return (
        <div className="register-form">
            <h1>{title}</h1>
            <form onSubmit={onSubmit}>
            <div>
                <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Ім'я користувача" />
            </div>
            <div>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Пароль"/>
            </div>
            {password2 !== undefined && (
                <div>
                    <input type="password" id="password2" value={password2} onChange={(e) => setPassword2(e.target.value)} required placeholder="Підтвердження пароля"/>
                </div>
            )}
            <button type="submit">{buttonText}</button>
            </form>
            {error && <div className="error">{error}</div>}
            {!error && message && <div className="success">{message}</div>}
        </div>
    );
} 

export default AuthForm;