import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import API from "../API";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      username,
      password,
      otp_code: otpCode,
    };

    try {
      const response = await API.post("/login/", data);

      if (response.data.message) {
        setMessage(response.data.message);
        setError("");
        navigate(`/profile/`);
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
    navigate("/profile/");
  };

  return (
    <AuthForm
      title="Авторизація"
      onSubmit={handleSubmit}
      username={username}
      setUsername={setUsername}
      password={password}
      setPassword={setPassword}
      otpCode={otpCode}
      setOtpCode={setOtpCode}
      error={error}
      message={message}
      buttonText="Увійти"
      anotherContent={
        <>
          <p>Ще не зареєстровані?</p>
          <button type="button" onClick={() => navigate("/register/")}>
            Зареєструватися
          </button>
        </>
      }
      onContinue={handleContinue}
    />
  );
}

export default Login;
