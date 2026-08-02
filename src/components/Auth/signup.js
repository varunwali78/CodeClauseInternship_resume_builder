import React, { useContext, useState } from "react";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiLock2Fill } from "react-icons/ri";
import { FaPencilAlt } from "react-icons/fa";
import { FaPhoneFlip } from "react-icons/fa6";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Context } from "../../index";
import styles from "./auth.module.css";
import SignupSvg from "../../assets/register.svg";

// ---- Validation helpers ----
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/; // valid 10 digit phone number
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]/\\;']/;

const validateEmail = (email) => {
  if (!email.trim()) return "Email is required";
  if (!EMAIL_REGEX.test(email)) return "Enter a valid email address";
  return "";
};

const validatePhone = (phone) => {
  if (!phone.trim()) return "Phone number is required";
  if (!/^\d{10}$/.test(phone)) return "Phone number must be exactly 10 digits";
  if (!PHONE_REGEX.test(phone)) return "Enter a valid 10 digit phone number";
  return "";
};

const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length > 12) return "Password must be at most 12 characters";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number";
  if (!SPECIAL_CHAR_REGEX.test(password))
    return "Password must contain at least one special character";
  return "";
};

const Signup = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    password: "",
  });

  const { isAuthorized, setIsAuthorized } = useContext(Context);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
  };

  const handlePhoneChange = (e) => {
    // only allow digits, cap length at 10
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(value);
    setErrors((prev) => ({ ...prev, phone: validatePhone(value) }));
  };

  const handlePasswordChange = (e) => {
    // cap length at 12 so the user can't even type past the limit
    const value = e.target.value.slice(0, 12);
    setPassword(value);
    setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone);
    const passwordError = validatePassword(password);

    setErrors({
      email: emailError,
      phone: phoneError,
      password: passwordError,
    });

    if (emailError || phoneError || passwordError) {
      toast.error("Please fix the highlighted fields before continuing");
      return;
    }

    try {
      setIsLoading(true); // Start showing loader
      const { data } = await axios.post(
        "https://resume-builder-backend-ce97.onrender.com/api/v1/user/signup",
        { name, phone, email, password },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin":
              "https://resume-frontend-project-1.onrender.com",
          },
          withCredentials: true,
          mode: "cors",
          credentials: "include",
        },
      );
      toast.success(data.message);
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setErrors({ email: "", phone: "", password: "" });
      setIsAuthorized(true);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false); // Hide loader after registration attempt
    }
  };

  if (isAuthorized) {
    return <Navigate to={"/"} />;
  }

  return isLoading ? (
    <Loader />
  ) : (
    <>
      <section className={styles.authPage}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2>Resume Builder</h2>
            <h3>Create a new account</h3>
          </div>
          <form>
            <div className={styles.inputTag}>
              <label>Name</label>
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <FaPencilAlt />
              </div>
            </div>
            <div className={styles.inputTag}>
              <label>Email Address</label>
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                />
                <MdOutlineMailOutline />
              </div>
              {errors.email && (
                <p
                  style={{
                    color: "#e53935",
                    fontSize: "0.85rem",
                    margin: "4px 0 0",
                  }}>
                  {errors.email}
                </p>
              )}
            </div>
            <div className={styles.inputTag}>
              <label>Phone Number</label>
              <div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={handlePhoneChange}
                />
                <FaPhoneFlip />
              </div>
              {errors.phone && (
                <p
                  style={{
                    color: "#e53935",
                    fontSize: "0.85rem",
                    margin: "4px 0 0",
                  }}>
                  {errors.phone}
                </p>
              )}
            </div>
            <div className={styles.inputTag}>
              <label>Password</label>
              <div>
                <input
                  type="password"
                  maxLength={12}
                  value={password}
                  onChange={handlePasswordChange}
                />
                <RiLock2Fill />
              </div>
              {errors.password ? (
                <p
                  style={{
                    color: "#e53935",
                    fontSize: "0.85rem",
                    margin: "4px 0 0",
                  }}>
                  {errors.password}
                </p>
              ) : (
                <p
                  style={{
                    color: "#888",
                    fontSize: "0.8rem",
                    margin: "4px 0 0",
                  }}>
                  Max 12 characters, at least 1 uppercase letter, 1 number & 1
                  special character
                </p>
              )}
            </div>
            <button type="submit" onClick={handleRegister}>
              Signup
            </button>
            <Link to={"/login"}>Login Now</Link>
          </form>
        </div>
        <div className={styles.banner}>
          <img src={SignupSvg} alt="login" />
        </div>
      </section>
    </>
  );
};

function Loader() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      className={styles.loadring}>
      <radialGradient
        id="a12"
        cx=".66"
        fx=".66"
        cy=".3125"
        fy=".3125"
        gradientTransform="scale(1.5)">
        <stop offset="0" stop-color="#6C63FF"></stop>
        <stop offset=".3" stop-color="#6C63FF" stop-opacity=".9"></stop>
        <stop offset=".6" stop-color="#6C63FF" stop-opacity=".6"></stop>
        <stop offset=".8" stop-color="#6C63FF" stop-opacity=".3"></stop>
        <stop offset="1" stop-color="#6C63FF" stop-opacity="0"></stop>
      </radialGradient>
      <circle
        transform-origin="center"
        fill="none"
        stroke="url(#a12)"
        stroke-width="6"
        stroke-linecap="round"
        stroke-dasharray="200 1000"
        stroke-dashoffset="0"
        cx="100"
        cy="100"
        r="70">
        <animateTransform
          type="rotate"
          attributeName="transform"
          calcMode="spline"
          dur="2"
          values="360;0"
          keyTimes="0;1"
          keySplines="0 0 1 1"
          repeatCount="indefinite"></animateTransform>
      </circle>
      <circle
        transform-origin="center"
        fill="none"
        opacity=".2"
        stroke="#6C63FF"
        stroke-width="6"
        stroke-linecap="round"
        cx="100"
        cy="100"
        r="70"></circle>
    </svg>
  );
}

export default Signup;
