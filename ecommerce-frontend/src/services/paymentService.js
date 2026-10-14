const API_BASE_URL = "http://localhost:8080/api";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("Please login before accessing payments.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function createPayment(
  orderId,
  paymentMethod
) {
  const params = new URLSearchParams({
    paymentMethod,
  });

  const response = await fetch(
    `${API_BASE_URL}/payments/order/${orderId}?${params.toString()}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText ||
        `Payment creation failed: ${response.status}`
    );
  }

  return response.json();
}

export async function getPaymentByOrderId(
  orderId
) {
  const response = await fetch(
    `${API_BASE_URL}/payments/order/${orderId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText ||
        `Failed to fetch payment: ${response.status}`
    );
  }

  return response.json();
}