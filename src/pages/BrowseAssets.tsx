import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAssets } from '@/services/assetService';
import React from 'react';

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
      <p>
        <strong>Value:</strong> ${asset.value.toLocaleString()}
      </p>
      <p>
        <strong>Description:</strong> {asset.description || "No description available"}
      </p>
      <p>
        <strong>Price per Share:</strong> ${asset.pricePerShare?.toFixed(2) || "N/A"}
      </p>
      {asset.images && asset.images.length > 0 && (
        <div className="mt-2">
          <p className="font-semibold">Images:</p>
          <div className="flex gap-2">
            {asset.images.map((image, idx) => (
              <img
                key={idx}
                src={image}
                alt={`${asset.name} image ${idx + 1}`}
                className="w-24 h-24 object-cover rounded-md border"
              />
            ))}
          </div>
        </div>
      )}
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
      {assets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center mt-10">
          No assets available. Please check back later or tokenize a new asset.
        </p>
      )}
    </div>
  );
};

export default BrowseAssets;
