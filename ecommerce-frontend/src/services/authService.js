const API_BASE_URL = "http://localhost:8080/api";

export async function registerUser(userData) {
  const response = await fetch(
    `${API_BASE_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        "Registration failed"
    );
  }

  return data;
}

export async function loginUser(credentials) {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        "Login failed"
    );
  }

  // Store JWT token for authenticated API requests
  if (data.token) {
    localStorage.setItem("authToken", data.token);
  }

  // Store user information if returned by backend
  if (data.user) {
    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );
  }

  return data;
}

export async function forgotPassword(email) {
  const response = await fetch(
    `${API_BASE_URL}/auth/forgot-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        "Failed to generate reset token"
    );
  }

  return data;
}

export async function resetPassword(
  token,
  newPassword
) {
  const response = await fetch(
    `${API_BASE_URL}/auth/reset-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        newPassword,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        "Password reset failed"
    );
  }

  return data;
}