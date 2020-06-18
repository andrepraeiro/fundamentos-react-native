import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const asyncStorageProducts = await AsyncStorage.getItem(
        '@goMarketPlace:products',
      );

      if (asyncStorageProducts) {
        setProducts(JSON.parse(asyncStorageProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const newProduct = { ...product, quantity: 1 };
      const newProducts = [...products, newProduct];
      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@goMarketPlace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const selectedProductIndex = products.findIndex(item => item.id === id);
      const selectedProduct = products[selectedProductIndex];
      const newProducts = products.slice(0, selectedProductIndex);
      selectedProduct.quantity += 1;
      setProducts([...newProducts, selectedProduct]);
      await AsyncStorage.setItem(
        '@goMarketPlace:products',
        JSON.stringify(newProducts),
      );
    },
    [products, setProducts],
  );

  const decrement = useCallback(
    async id => {
      const selectedProductIndex = products.findIndex(item => item.id === id);
      const selectedProduct = products[selectedProductIndex];
      const newProducts = products.slice(0, selectedProductIndex);
      selectedProduct.quantity -= 1;
      setProducts([...newProducts, selectedProduct]);
      await AsyncStorage.setItem(
        '@goMarketPlace:products',
        JSON.stringify(newProducts),
      );
    },
    [products, setProducts],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
