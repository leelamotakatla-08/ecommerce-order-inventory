import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const OrderContext = createContext(null);

function getStoredOrders() {
  try {
    const storedOrders =
      localStorage.getItem("shopsphere_orders");

    return storedOrders
      ? JSON.parse(storedOrders)
      : [];
  } catch {
    return [];
  }
}

export function OrderProvider({ children }) {
  const [orders, setOrders] =
    useState(getStoredOrders);

  useEffect(() => {
    localStorage.setItem(
      "shopsphere_orders",
      JSON.stringify(orders)
    );
  }, [orders]);

  const addOrder = (order) => {
    setOrders((currentOrders) => [
      order,
      ...currentOrders,
    ]);
  };

  const getOrderById = (orderId) => {
    return orders.find(
      (order) => order.id === orderId
    );
  };

  const clearOrders = () => {
    setOrders([]);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        getOrderById,
        clearOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error(
      "useOrders must be used inside OrderProvider"
    );
  }

  return context;
}