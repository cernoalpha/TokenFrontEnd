import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAsset } from '@/services/assetService';



const AssetDetails: React.FC = () => {
  const { id } = useParams<{ id?: string }>();

  if (!id) {
    return <div>Asset ID is missing</div>;
  }

  const asset: Asset | null = useAsset(id);

  if (!asset) {
    return <div>Asset not found</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Asset Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>{asset.name}</CardTitle>
          <CardDescription>Token ID: {asset.tokenId}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-2">Value: ${asset.value.toLocaleString()}</p>
          <p className="mb-4">Description: {asset.description}</p>
          <Button asChild>
            <Link to={`/${asset.id}/trade`}>Trade Asset</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetDetails;
