const API_BASE_URL = "http://localhost:8080/api";

export async function getInventoryByProductId(productId) {
  const response = await fetch(
    `${API_BASE_URL}/inventory/${productId}`
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText ||
        `Failed to fetch inventory: ${response.status}`
    );
  }

  return response.json();
}