import { useState, useEffect } from 'react';


export const useAssets = (): Asset[] => {
  const [allAssets, setAllAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch('http://localhost:8979/api/assets');
        const data = await response.json();

        // Ensure default values for missing fields
        const processedAssets = data.map((asset: any) => ({
          ...asset,
          ownershipDocument: asset.ownershipDocument || '',
          images: asset.images || [],
          totalShares: asset.totalShares || 100,
          pricePerShare: asset.pricePerShare || asset.value / 100,
          priceHistory: asset.priceHistory || [],
        }));

        setAllAssets(processedAssets);
      } catch (error) {
        console.error('Error fetching assets:', error);
      }
    };

    fetchAssets();
  }, []);

  return allAssets;
};


export const useAsset = (id: string): Asset | null => {
  const [asset, setAsset] = useState<Asset | null>(null);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const response = await fetch(`http://localhost:8979/api/assets/${id}`);
        const data = await response.json();
        setAsset(data);
      } catch (error) {
        console.error('Error fetching asset:', error);
      }
    };

    fetchAsset();
  }, [id]);

  return asset;
};

export const tokenizeAsset = async (newAsset: FormData): Promise<Asset> => {
  try {
    const response = await fetch('http://localhost:8979/api/assets', {
      method: 'POST',
      body: newAsset, 
    });

    const createdAsset = await response.json();
    return createdAsset;
  } catch (error) {
    console.error('Error tokenizing asset:', error);
    throw error;
  }
};

