import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/userContext";

export default function Login() {
  const { setFullName, setARole, setCEmail } = useContext(UserContext);
  const [isLogin, setIsLogin] = useState(true);
  const [buyerSelected, setBuyerSelected] = useState(false);
  const [sellerSelected, setSellerSelected] = useState(false);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleLogin = () => setIsLogin(true);
  const handleRegister = () => setIsLogin(false);

  //register+login
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameEmail, setUsernameEmail] = useState("");
  //login form
  const loginFormSubmit = async () => {
    if (!usernameEmail || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    const isEmail = usernameEmail.includes("@");
    const data = {
      [isEmail ? "email" : "username"]: usernameEmail,
      password,
    };

    try {
      const result = await axios.post(
        `http://localhost:9000/api/v1/users/login`,
        data,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log(result);

      const responseData = result.data;

      if (responseData.success) {
        setFullName(responseData.data.user.fullname);
        setARole(responseData.data.user.activeRole);
        setCEmail(responseData.data.user.email);
        setMessage(`Welcome ${responseData.data.user.fullname}`);
        setTimeout(() => {
          if (responseData.data.user.activeRole === "buyer") {
            navigate("/products");
          } else {
            navigate("/Dashboard");
          }
        }, 100);
      } else {
        setMessage("Login failed. Please check your credentials. ");
      }
    } catch (error) {
      const backendError = error.response?.data;
      const errorMessages = backendError?.errors?.length
        ? backendError.errors.join(", ")
        : backendError?.message ||
          "Login failed! Please check your credentials or Register Again";
      setMessage(errorMessages);
      setIsLogin(false);
    }
  };

  const registerFormSubmit = async () => {
    if (!fullname || !email || !username || !password) {
      setMessage("All fields are required for registration.");
      return;
    }

    // Collect selected roles
    const role = [];
    if (buyerSelected) role.push("buyer");
    if (sellerSelected) role.push("seller");

    if (role.length === 0) {
      setMessage("Please select at least one role (Buyer or Seller).");
      return;
    }

    const data = { fullname, email, username, password, role };

    try {
      const result = await axios.post(
        `http://localhost:9000/api/v1/users/register`,
        data,
        { headers: { "Content-Type": "application/json" } }
      );

      const responseData = result.data;

      if (responseData.success) {
        setMessage("Registration successful! Please log in.");
        setIsLogin(true); // Switch to Login view
      } else {
        setMessage("Registration failed. Please try again.");
      }
    } catch (error) {
      const backendError = error.response?.data;
      const errorMessages = backendError?.errors?.length
        ? backendError.errors.join(", ")
        : backendError?.message || "Registration failed! Please try again.";
      setMessage(errorMessages);
    }
  };

  return (
    <div className="font-['Alegreya_SC'] bg-gradient-radial from-blanchedalmond to-[#d9b89e] min-h-screen">
      <header className="bg-[url('/images/background2.jpg')] bg-cover bg-center bg-no-repeat">
        <div className="container mx-auto px-6 max-w-7xl">
          <nav className="flex items-center justify-between py-5">
            <div className="logo">
              <img
                src="./images/logo.jpg"
                alt="Logo"
                width={125}
                height={125}
              />
            </div>
            <ul className="flex space-x-5 text-right pr-20">
              <li>
                <Link
                  to="/"
                  className="font-mono text-lg text-[#41290c] hover:text-[#8f887b] pr-20"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="font-mono text-lg text-[#41290c] hover:text-[#8f887b] pr-20"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="font-mono text-lg text-[#41290c] hover:text-[#8f887b] pr-20"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="font-mono text-lg text-[#41290c] hover:text-[#88f87b] pr-20"
                >
                  <u>Login</u>
                </Link>
              </li>
            </ul>
            <img
              src="/images/cart.png"
              alt="Cart"
              width={30}
              height={30}
              className="cart"
            />
          </nav>
        </div>
      </header>

      <main className="py-12">
        <div
          className="text-2xl font-['Alegreya_SC'] text-[#41290c] text-center"
          id="displayM"
        >
          {message}
        </div>
        <div className="max-w-[1300px] mx-auto px-[25px]">
          <div className="flex items-center justify-around">
            <div className="w-1/2">
              <img
                src="/images/model2.png"
                alt="Model"
                width={500}
                height={750}
                className="w-300px pr-6"
              />
            </div>
            <div className="w-1/2">
              <div className="bg-[url('/images/background1.jpg')] bg-cover w-[300px] h-[450px] relative text-center py-5 mx-auto shadow-[0_0_20px_0_rgba(0,0,0,0.1)] overflow-hidden">
                <div className="inline-block">
                  <span
                    onClick={handleLogin}
                    className="font-bold px-[10px] text-[#41290c] cursor-pointer w-[100px] inline-block font-['Alegreya_SC']"
                  >
                    Login
                  </span>
                  <span
                    onClick={handleRegister}
                    className="font-bold px-[10px] text-[#41290c] cursor-pointer w-[100px] inline-block font-['Alegreya_SC']"
                  >
                    Register
                  </span>
                  <hr
                    className="w-[100px] border-none bg-[#41290c] h-[3px] mt-[8px] translate-x-[100px] transition-transform duration-1000"
                    style={{
                      transform: isLogin
                        ? "translateX(0px)"
                        : "translateX(100px)",
                    }}
                  />
                </div>
                {/* Login Form */}
                <form
                  className="max-w-[300px] px-[20px] absolute top-[130px] transition-transform duration-1000"
                  style={{
                    transform: isLogin
                      ? "translateX(0px)"
                      : "translateX(-300px)",
                  }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    loginFormSubmit();
                  }}
                >
                  <input
                    type="text"
                    value={usernameEmail}
                    onChange={(e) => setUsernameEmail(e.target.value)}
                    placeholder="Username or Email"
                    className="w-full h-[30px] my-[10px] px-[10px] border border-[#fea069]"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full h-[30px] my-[10px] px-[10px] border border-[#fea069]"
                  />
                  <button
                    type="submit"
                    className="btn w-full bg-[#41290c] text-white rounded-full py-2 hover:bg-[#402718]"
                  >
                    Login
                  </button>
                  <Link to="/" className="block mt-3 text-[#41290c]">
                    Forgot password?
                  </Link>
                </form>

                {/* Register Form */}
                <form
                  className="max-w-[300px] px-[20px] absolute top-[130px] transition-transform duration-1000"
                  style={{
                    transform: isLogin
                      ? "translateX(300px)"
                      : "translateX(0px)",
                  }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    registerFormSubmit();
                  }}
                >
                  <input
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="Fullname"
                    className="w-full h-[30px] my-[10px] px-[10px] border border-[#fea069]"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full h-[30px] my-[10px] px-[10px] border border-[#fea069]"
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full h-[30px] my-[10px] px-[10px] border border-[#fea069]"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full h-[30px] my-[10px] px-[10px] border border-[#fea069]"
                  />
                  <div className="flex gap-3 justify-center mb-5">
                    <div
                      className={`py-2 px-4 rounded-full cursor-pointer ${
                        buyerSelected ? "bg-[#92552f]" : "bg-[#775021]"
                      } text-[#f5cb90] `}
                      onClick={() => setBuyerSelected(!buyerSelected)}
                    >
                      Buyer
                    </div>
                    <div
                      className={`py-2 px-4 rounded-full cursor-pointer ${
                        sellerSelected ? "bg-[#92552f]" : "bg-[#775021]"
                      } text-[#f5cb90]`}
                      onClick={() => setSellerSelected(!sellerSelected)}
                    >
                      Seller
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn w-full bg-[#41290c] text-white rounded-full py-2 hover:bg-[#402718]"
                  >
                    Register
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#1d1010] text-center py-12">
        <div className="max-w-[1300px] mx-auto px-[25px]">
          <h2 className="text-[#d9b89e] text-2xl font-bold">
            Thank You For Visiting
            <br />
            ONEMOVE
          </h2>
          <p className="text-[#92552f]">
            OneMove is an Ecommerce Website providing benefits to both Buyer and
            Seller.
          </p>
        </div>
      </footer>
    </div>
  );
}
