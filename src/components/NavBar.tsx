import { Link } from 'react-router-dom';
import ConnectWallet from './WalletConnect';

const Navbar = () => {
  return (
    <nav className="bg-primary text-primary-foreground w-screen">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Fractiona</Link>
        <div className="space-x-4">
          <Link to="/browse" className="hover:underline">Browse Assets</Link>
          <Link to="/tokenize" className="hover:underline">Tokenize Asset</Link>
          <Link to="/login" className="hover:underline">Login</Link>
          <ConnectWallet/>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;