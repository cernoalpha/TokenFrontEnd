import { useState, useEffect } from 'react';

interface Asset {
    id: string;
    name: string;
    tokenId: string;
    value: number;
    owner: string;
    description: string;
  }
  

  let assets: Asset[] = [
  { id: '1', name: 'Luxury Apartment', tokenId: '0x123', value: 500000, owner: '0xabc...', description: 'A high-end apartment in the city center.' },
  { id: '2', name: 'Vintage Painting', tokenId: '0x456', value: 100000, owner: '0xdef...', description: 'A rare painting from the 18th century.' },
];

export const useAssets = (): Asset[] => {
    const [allAssets, setAllAssets] = useState<Asset[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setAllAssets(assets);
    }, 500);
  }, []);

  return allAssets;
};

export const useAsset = (id: string): Asset | null => {
    const [asset, setAsset] = useState<Asset | null>(null);

  useEffect(() => {
    setTimeout(() => {
        const foundAsset = assets.find(a => a.id === id) || null;
      setAsset(foundAsset);
    }, 500);
  }, [id]);

  return asset;
};

export const tokenizeAsset = (newAsset: Omit<Asset, 'id' | 'tokenId' | 'owner'>): Asset => {
  const asset = {
    id: (assets.length + 1).toString(),
    tokenId: `0x${Math.floor(Math.random() * 1000).toString(16)}`,
    owner: '0x' + Math.random().toString(36).substr(2, 8),
    ...newAsset,
  };
  assets.push(asset);
  return asset;
};