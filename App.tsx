import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './components/LoginPage';
import ProductsPage from './components/ProductsPage';
import AdminPanel from './components/AdminPanel';
import MaintenancePage from './components/MaintenancePage';

function AppContent() {
  const { currentPage, siteOnline } = useApp();

  // If site is offline and user is NOT on admin page, show maintenance
  if (!siteOnline && currentPage !== 'admin') {
    return <MaintenancePage />;
  }

  switch (currentPage) {
    case 'login':
      return <LoginPage />;
    case 'products':
      return <ProductsPage />;
    case 'admin':
      return <AdminPanel />;
    default:
      return <LoginPage />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
