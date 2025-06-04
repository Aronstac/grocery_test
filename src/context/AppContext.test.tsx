import { render, screen } from '@testing-library/react';
import React from 'react';
import { AppProvider, useAppContext } from './AppContext';
import { mockProducts } from '../data/mockData';

function ProductsCount() {
  const { products, loading } = useAppContext();
  if (loading) return <span>loading...</span>;
  return <span>{products.length}</span>;
}

test('AppProvider provides mock products', async () => {
  render(
    <AppProvider>
      <ProductsCount />
    </AppProvider>
  );
  const count = await screen.findByText(String(mockProducts.length));
  expect(count).toBeInTheDocument();
});
