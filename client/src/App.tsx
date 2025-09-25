import { Container } from 'react-bootstrap';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';

import ProductPage from './pages/ProductPage';

import ProductCreatePage from './pages/ProductCreatePage';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import ProfilePage from './pages/ProfilePage';

import ChatPage from './pages/ChatPage';

import MatchedProductsPage from './pages/MatchedProductsPage';

function App() {
  return (
    <>
      <Header />
      <main className="py-3">
        <Container>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/products/add" element={<ProductCreatePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/product/:id/chat" element={<ChatPage />} />
            <Route path="/matched-products" element={<MatchedProductsPage />} />
          </Routes>
        </Container>
      </main>
    </>
  );
}

export default App;
