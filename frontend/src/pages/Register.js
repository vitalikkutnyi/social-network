import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import API from "../API";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [autoVerified2FA, setAutoVerified2FA] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      username,
      password,
      password2,
    };

    try {
      const response = await API.post("/register/", data, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (response.data.message) {
        setMessage(response.data.message);
        setError("");
        setQrCode(response.data.qr_code);
        if (response.data.auto_verified_2fa) {
          setAutoVerified2FA(true);
        }
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        setError(error.response.data.error);
        setMessage("");
      } else {
        setError("Сталася помилка при відправці запиту");
      }
    }
  };

  const handleContinue = () => {
    if (autoVerified2FA) {
      navigate("/profile/");
    } else {
      setError("2FA не підтверджено. Будь ласка, увійдіть вручну.");
      navigate("/login/");
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
      qrCode={qrCode}
      setQrCode={setQrCode}
      error={error}
      message={message}
      buttonText="Зареєструватися"
      anotherContent={
        <>
          <p>Вже зареєстровані?</p>
          <button type="button" onClick={() => navigate("/login/")}>
            Увійти
          </button>
        </>
      }
      onContinue={handleContinue}
    />
  );
}

export default Register;
