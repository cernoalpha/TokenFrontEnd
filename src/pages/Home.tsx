import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to Fractiona</h1>
      <p className="mb-8">Tokenize and trade real-world assets on the blockchain.</p>
      <div className="space-x-4">
        <Button asChild>
          <Link to="/browse">Browse Assets</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/tokenize">Tokenize Asset</Link>
        </Button>
      </div>
    </div>
  );
};

export default Home;