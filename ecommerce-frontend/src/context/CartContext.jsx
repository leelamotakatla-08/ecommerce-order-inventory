
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart as clearBackendCart,
  getCart,
  requireUserId,
} from "../services/cartService";

import { getProductById } from "../services/productService";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const userId = requireUserId();

        const cart = await getCart(userId);
        const items = cart?.items || [];

        const enrichedItems = await Promise.all(
          items.map(async (item) => {
            try {
              const product = await getProductById(item.productId);

              return {
                ...product,
                quantity: item.quantity,
                cartItemId: item.id,
              };
            } catch (error) {
              console.error(
                `Failed to load product ${item.productId}:`,
                error
              );

              return {
                id: item.productId,
                name: item.productName,
                price: Number(item.unitPrice),
                quantity: item.quantity,
                cartItemId: item.id,
              };
            }
          })
        );

        setCartItems(enrichedItems);
      } catch (error) {
        console.error("Failed to load cart:", error);
        setCartItems([]);
      } finally {
        setCartLoading(false);
      }
    };

    loadCart();
  }, []);

  const addToCart = async (product, quantity = 1) => {
    try {
      const userId = requireUserId();

      const cart = await addItemToCart(
        userId,
        product.id,
        quantity
      );

      const updatedItem = cart?.items?.find(
        (item) => item.productId === product.id
      );

      setCartItems((currentItems) => {
        const existingItem = currentItems.find(
          (item) => item.id === product.id
        );

        if (existingItem) {
          return currentItems.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity:
                    updatedItem?.quantity ??
                    item.quantity + quantity,
                }
              : item
          );
        }

        return [
          ...currentItems,
          {
            ...product,
            quantity:
              updatedItem?.quantity ?? quantity,
            cartItemId: updatedItem?.id,
          },
        ];
      });

      return cart;
    } catch (error) {
      console.error("Add to cart failed:", error);
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      const userId = requireUserId();

      const cart = await updateCartItem(
        userId,
        productId,
        quantity
      );

      const updatedItem = cart?.items?.find(
        (item) => item.productId === productId
      );

      setCartItems((currentItems) =>
        currentItems.map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity:
                  updatedItem?.quantity ?? quantity,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Update cart quantity failed:",
        error
      );

      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const userId = requireUserId();

      await removeCartItem(userId, productId);

      setCartItems((currentItems) =>
        currentItems.filter(
          (item) => item.id !== productId
        )
      );
    } catch (error) {
      console.error(
        "Remove cart item failed:",
        error
      );

      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const userId = requireUserId();

      await clearBackendCart(userId);

      setCartItems([]);
    } catch (error) {
      console.error("Clear cart failed:", error);
      throw error;
    }
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) * item.quantity,
      0
    );
  }, [cartItems]);

  const shipping =
    subtotal === 0
      ? 0
      : subtotal >= 1000
        ? 0
        : 99;

  const total = subtotal + shipping;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal,
        shipping,
        total,
        cartLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}

