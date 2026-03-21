/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Analysis } from './pages/Analysis';
import { History } from './pages/History';
import { StyleLab } from './pages/StyleLab';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analysis/:id" element={<Analysis />} />
          <Route path="/history" element={<History />} />
          <Route path="/style-lab/:id" element={<StyleLab />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
