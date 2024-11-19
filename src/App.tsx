import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from '@/components/NavBar';
import Home from '@/pages/Home';
import BrowseAssets from '@/pages/BrowseAssets';
import TokenizeAsset from '@/pages/TokenizeAsset';
import LoginPage from '@/pages/Login';
import AssetTradingPage from '@/pages/AssetTradingPage';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-6 px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<BrowseAssets />} />
            <Route path="/tokenize" element={<TokenizeAsset />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/:id/trade" element={<AssetTradingPage />} />
            <Route path="login/:id/trade" element={<AssetTradingPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;