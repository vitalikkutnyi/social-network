import React from "react";

function AuthForm({
  title,
  onSubmit,
  username,
  setUsername,
  password,
  setPassword,
  password2,
  setPassword2,
  qrCode,
  setQrCode,
  otpCode,
  setOtpCode,
  error,
  message,
  buttonText,
  anotherContent,
  onContinue,
}) {
  return (
    <>
      <div className="register-form">
        <h1>{title}</h1>
        <form onSubmit={onSubmit}>
          <div className="input-container">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Ім'я користувача"
            />
          </div>
          <div className="input-container">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Пароль"
            />
          </div>
          {password2 !== undefined && (
            <div className="input-container">
              <input
                type="password"
                id="password2"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                placeholder="Підтвердження пароля"
              />
            </div>
          )}
          {setOtpCode && (
            <div className="code">
              <input
                type="text"
                id="otpCode"
                value={otpCode || ""}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Одноразовий код"
              />
            </div>
          )}
          <button type="submit">{buttonText}</button>
          {anotherContent}
        </form>
        {error && <div className="error">{error}</div>}
        {message && <p>{message}</p>}
      </div>
      {qrCode && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-content">
            <h2>Двофакторна аутентифікація</h2>
            <p>Відскануйте QR-код у Google Authenticator:</p>
            <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" />
            <button type="button" onClick={onContinue}>
              Продовжити
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AuthForm;
