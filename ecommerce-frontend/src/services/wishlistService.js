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

function getUserId() {
  const storedUser = localStorage.getItem("authUser");

  if (!storedUser) {
    throw new Error("Please login before using the wishlist.");
  }

  const user = JSON.parse(storedUser);

  if (!user?.userId) {
    throw new Error("Logged-in user information is missing.");
  }

  return user.userId;
}

export async function getWishlist() {
  const userId = getUserId();

  const response = await fetch(
    `${API_BASE_URL}/wishlists/${userId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || `Failed to fetch wishlist: ${response.status}`
    );
  }

  return response.json();
}

export async function addToWishlist(productId) {
  const userId = getUserId();

  const response = await fetch(
    `${API_BASE_URL}/wishlists/${userId}/products/${productId}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || `Failed to add to wishlist: ${response.status}`
    );
  }

  return response.json();
}

export async function removeFromWishlist(productId) {
  const userId = getUserId();

  const response = await fetch(
    `${API_BASE_URL}/wishlists/${userId}/products/${productId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok && response.status !== 204) {
    const errorText = await response.text();
    throw new Error(
      errorText || `Failed to remove from wishlist: ${response.status}`
    );
  }
}

export async function isInWishlist(productId) {
  const userId = getUserId();

  const response = await fetch(
    `${API_BASE_URL}/wishlists/${userId}/products/${productId}/exists`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || `Failed to check wishlist: ${response.status}`
    );
  }

  return response.json();
}