import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AssetCardProps {
  asset: Asset; // Use the global `Asset` interface
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
        <strong>Price per Share:</strong> ${asset.pricePerShare.toFixed(2)}
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

export default AssetCard;
