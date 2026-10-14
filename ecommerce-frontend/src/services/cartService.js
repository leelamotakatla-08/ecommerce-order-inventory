const API_BASE_URL = "http://localhost:8080/api";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");

  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : {
        "Content-Type": "application/json",
      };
}

function requireUserId() {
  const storedUser = localStorage.getItem("authUser");

  if (!storedUser) {
    throw new Error("Please login before using the cart.");
  }

  const user = JSON.parse(storedUser);

  if (!user?.userId) {
    throw new Error("Logged-in user information is missing.");
  }

  return user.userId;
}

export async function addItemToCart(
  userId,
  productId,
  quantity
) {
  const response = await fetch(
    `${API_BASE_URL}/carts/${userId}/items`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        productId,
        quantity,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText ||
        `Failed to add item: ${response.status}`
    );
  }

  return response.json();
}

export async function updateCartItem(
  userId,
  productId,
  quantity
) {
  const response = await fetch(
    `${API_BASE_URL}/carts/${userId}/items/${productId}?quantity=${quantity}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText ||
        `Failed to update cart: ${response.status}`
    );
  }

  return response.json();
}

export async function removeCartItem(
  userId,
  productId
) {
  const response = await fetch(
    `${API_BASE_URL}/carts/${userId}/items/${productId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText ||
        `Failed to remove cart item: ${response.status}`
    );
  }

  return response.json();
}

export async function clearCart(userId) {
  const response = await fetch(
    `${API_BASE_URL}/carts/${userId}/items`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok && response.status !== 204) {
    const errorText = await response.text();

    throw new Error(
      errorText ||
        `Failed to clear cart: ${response.status}`
    );
  }
}

export async function getCart(userId) {
  const response = await fetch(
    `${API_BASE_URL}/carts/${userId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText ||
        `Failed to fetch cart: ${response.status}`
    );
  }

  return response.json();
}

export { requireUserId };