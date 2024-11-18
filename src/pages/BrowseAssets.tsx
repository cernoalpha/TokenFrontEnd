import { useAssets } from "@/services/assetService";
import AssetCard from "@/components/AssetCard";
import ErrorBoundary from "@/components/ErrorBoundary";

const BrowseAssets = () => {
  const assets: Asset[] = useAssets();
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
};

export default BrowseAssets;
