
const API_BASE_URL = "http://localhost:8080/api";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("Please login before accessing orders.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function checkoutOrder(userId, addressId) {
  const response = await fetch(
    `${API_BASE_URL}/orders/checkout`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        userId,
        addressId,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText ||
        `Checkout failed: ${response.status}`
    );
  }

  return response.json();
}

export async function getOrdersByUserId(userId) {
  const response = await fetch(
    `${API_BASE_URL}/orders/user/${userId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText ||
        `Failed to fetch orders: ${response.status}`
    );
  }

  return response.json();
}

export async function getOrderById(orderId) {
  const response = await fetch(
    `${API_BASE_URL}/orders/${orderId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText ||
        `Failed to fetch order: ${response.status}`
    );
  }

  return response.json();
}

export async function getOrderStatusHistory(orderId) {
  const response = await fetch(
    `${API_BASE_URL}/orders/${orderId}/status-history`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText ||
        `Failed to fetch order history: ${response.status}`
    );
  }

  return response.json();
}

