import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAssets } from '@/services/assetService';


interface Asset {
    id: string;
    name: string;
    tokenId: string;
    value: number;
    owner: string;
  }
  
  interface AssetCardProps {
    asset: Asset;
  }

  

  const AssetCard: React.FC<AssetCardProps> = ({ asset }) => (
  <Card>
    <CardHeader>
      <CardTitle>{asset.name}</CardTitle>
      <CardDescription>Token ID: {asset.tokenId}</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Value: ${asset.value.toLocaleString()}</p>
      <p>Owner: {asset.owner}</p>
    </CardContent>
    <CardFooter>
      <Button asChild>
        <Link to={`/asset/${asset.id}`}>View Details</Link>
      </Button>
    </CardFooter>
  </Card>
);

const BrowseAssets = () => {
  const assets = useAssets();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Browse Tokenized Assets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
};

export default BrowseAssets;