import React, { useState } from "react";
import { Helmet } from "react-helmet";
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
      const response = await API.post("/api/register/", data, {
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
    <>
      <Helmet>
        <meta name="robots" content="index, follow" />
        <meta
          name="description"
          content="Зареєструйтеся в соціальній мережі Lynquora, щоби спілкуватися, ділитися публікаціями та знаходити нових друзів."
        />
        <meta
          name="keywords"
          content="реєстрація, створення акаунта, соціальна мережа, Lynquora, спілкування, друзі"
        />
        <meta property="og:title" content="Реєстрація / Lynquora" />
        <meta
          property="og:description"
          content="Зареєструйтеся в соціальній мережі Lynquora, щоби спілкуватися, ділитися публікаціями та знаходити нових друзів."
        />
        <meta
          property="og:image"
          content="https://lynquora.me/favicon.ico?v=3"
        />
        <meta property="og:url" content="https://lynquora.me/register/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Реєстрація / Lynquora" />
        <meta
          name="twitter:description"
          content="Зареєструйтеся в соціальній мережі Lynquora, щоби спілкуватися, ділитися публікаціями та знаходити нових друзів."
        />
        <meta
          name="twitter:image"
          content="https://lynquora.me/favicon.ico?v=3"
        />
        <link rel="canonical" href="https://lynquora.me/register/" />
        <title>Реєстрація | Lynquora</title>
      </Helmet>
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
    </>
  );
}

export default Register;
