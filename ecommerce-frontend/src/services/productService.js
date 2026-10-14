const API_BASE_URL = "http://localhost:8080/api";

export async function getProducts({
  page = 0,
  size = 10,
  sortBy = "id",
  direction = "asc",
  keyword = "",
  categoryId = null,
  minPrice = null,
  maxPrice = null,
  available = null,
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    direction,
  });

  if (keyword.trim()) {
    params.set("keyword", keyword.trim());
  }

  if (categoryId !== null && categoryId !== undefined) {
    params.set("categoryId", String(categoryId));
  }

  if (minPrice !== null && minPrice !== undefined) {
    params.set("minPrice", String(minPrice));
  }

  if (maxPrice !== null && maxPrice !== undefined) {
    params.set("maxPrice", String(maxPrice));
  }

  if (available !== null && available !== undefined) {
    params.set("available", String(available));
  }

  const response = await fetch(
    `${API_BASE_URL}/products?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch products: ${response.status}`
    );
  }

  return response.json();
}

export async function getProductById(id) {
  const response = await fetch(
    `${API_BASE_URL}/products/${id}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch product: ${response.status}`
    );
  }

  return response.json();
}