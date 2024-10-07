import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from '@/components/NavBar';
import Home from '@/pages/Home';
import BrowseAssets from '@/pages/BrowseAssets';
import TokenizeAsset from '@/pages/TokenizeAsset';
import AssetDetails from '@/pages/AssetDetails';
import LoginPage from '@/pages/Login';

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
            <Route path="/asset/:id" element={<AssetDetails />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;