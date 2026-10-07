import React, { createContext, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

export const Context = createContext();

const AppWrapper = () => {
  const [user, setUser] = useState({});
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <Context.Provider
      value={{
        user,
        setUser,
        selectedImage,
        setSelectedImage,
      }}>
      <App />
    </Context.Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<AppWrapper />);
