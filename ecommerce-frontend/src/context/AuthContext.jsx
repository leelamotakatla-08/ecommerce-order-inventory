import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  registerUser,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("authToken")
  );

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("authUser");

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  });

  const isAuthenticated = Boolean(token);

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "authUser",
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem("authUser");
    }
  }, [user]);

  async function login(credentials) {
    const data = await loginUser(credentials);

    setToken(data.token);

    setUser({
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
    });

    return data;
  }

  async function register(userData) {
    return registerUser(userData);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}