import React, { useState } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";

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
      const response = await axios.post("/api/login/", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.message) {
        setMessage(response.data.message);
        setError("");
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);
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

  return (
    <>
      <Helmet>
        <meta name="robots" content="index, follow" />
        <meta
          name="description"
          content="Авторизуйтеся в соціальній мережі Lynquora, щоби спілкуватися, ділитися публікаціями та знаходити нових друзів."
        />
        <meta
          name="keywords"
          content="вхід, логін, авторизація, соціальна мережа, Lynquora, спілкування, друзі"
        />
        <meta property="og:title" content="Авторизація / Lynquora" />
        <meta
          property="og:description"
          content="Авторизуйтеся в соціальній мережі Lynquora, щоби спілкуватися, ділитися публікаціями та знаходити нових друзів."
        />
        <meta
          property="og:image"
          content="https://lynquora.me/favicon.ico?v=3"
        />
        <meta property="og:url" content="https://lynquora.me/login/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Авторизація / Lynquora" />
        <meta
          name="twitter:description"
          content="Авторизуйтеся в соціальній мережі Lynquora, щоби спілкуватися, ділитися публікаціями та знаходити нових друзів."
        />
        <meta
          name="twitter:image"
          content="https://lynquora.me/favicon.ico?v=3"
        />
        <link rel="canonical" href="https://lynquora.me/login/" />
        <title>Авторизація / Lynquora</title>
      </Helmet>
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
      />
    </>
  );
}

export default Login;
