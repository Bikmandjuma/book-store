import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import BookDetails from './pages/BookDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Wishlist from './pages/Wishlist'
import Orders from './pages/Orders'
import About from './pages/About'
import Policies from './pages/Policies'
import Manage from './pages/Manage'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="books/:slug" element={<BookDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order/:ref" element={<OrderConfirmation />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="orders" element={<Orders />} />
        <Route path="about" element={<About />} />
        <Route path="policies" element={<Policies />} />
        <Route path="manage/:tab?" element={<Manage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
