import { useState, useEffect } from 'react';

interface Asset {
  id: string;
  name: string;
  tokenId: string;
  value: number;
  owner: string;
  description: string;
}

export const useAssets = (): Asset[] => {
  const [allAssets, setAllAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch('http://localhost:8979/api/assets');
        const data = await response.json();
        setAllAssets(data);
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

export const tokenizeAsset = async (newAsset: Omit<Asset, 'id' | 'tokenId' | 'owner'>): Promise<Asset> => {
  try {
    const response = await fetch('http://localhost:8979/api/assets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newAsset),
    });

    const createdAsset = await response.json();
    return createdAsset;
  } catch (error) {
    console.error('Error tokenizing asset:', error);
    throw error;
  }
};
