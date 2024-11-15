import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { tokenizeAsset } from '@/services/assetService';

const TokenizeAsset: React.FC = () => {
  const [assetName, setAssetName] = useState<string>('');
  const [assetValue, setAssetValue] = useState<string>('');
  const [assetDescription, setAssetDescription] = useState<string>('');
  const [assetType, setAssetType] = useState<string>('Physical'); // Physical or Digital
  const [ownershipDocument, setOwnershipDocument] = useState<File | null>(null);
  const [assetImages, setAssetImages] = useState<FileList | null>(null);
  const [totalShares, setTotalShares] = useState<number>(100); // Default value
  const [pricePerShare, setPricePerShare] = useState<number>(0);
  const navigate = useNavigate();

  // Update price per share whenever value or shares change
  const updatePricePerShare = () => {
    const value = parseFloat(assetValue);
    if (value > 0 && totalShares >= 100) {
      setPricePerShare(value / totalShares);
    } else {
      setPricePerShare(0);
    }
  };

  const handleValueChange = (value: string) => {
    setAssetValue(value);
    updatePricePerShare();
  };

  const handleSharesChange = (shares: number) => {
    if (shares >= 100) {
      setTotalShares(shares);
      updatePricePerShare();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
  
    if (!ownershipDocument && assetType === "Physical") {
      alert("Ownership document is required for physical assets.");
      return;
    }
  
    const formData = new FormData();
    formData.append('name', assetName);
    formData.append('value', assetValue);
    formData.append('description', assetDescription);
    formData.append('type', assetType);
    if (ownershipDocument) formData.append('ownershipDocument', ownershipDocument);
    if (assetImages) {
      Array.from(assetImages).forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });
    }
    formData.append('totalShares', totalShares.toString());
    formData.append('pricePerShare', pricePerShare.toString());
  
    try {
      const createdAsset = await tokenizeAsset(formData);
      navigate(`/asset/${createdAsset.id}`);
    } catch (error) {
      console.error('Error creating asset:', error);
    }
  };
  

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tokenize New Asset</h1>
      <Card>
        <CardHeader>
          <CardTitle>Asset Details</CardTitle>
          <CardDescription>Enter the details of the asset you want to tokenize.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Asset Type Toggle */}
            <div className="space-y-2">
              <Label>Asset Type</Label>
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant={assetType === "Physical" ? "default" : "outline"}
                  onClick={() => setAssetType("Physical")}
                >
                  Physical
                </Button>
                <Button
                  type="button"
                  variant={assetType === "Digital" ? "default" : "outline"}
                  onClick={() => setAssetType("Digital")}
                >
                  Digital
                </Button>
              </div>
            </div>

            {/* Asset Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name</Label>
              <Input
                id="name"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                required
              />
            </div>

            {/* Asset Value */}
            <div className="space-y-2">
              <Label htmlFor="value">Asset Value ($)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="1"
                value={assetValue}
                onChange={(e) => handleValueChange(e.target.value)}
                required
              />
            </div>

            {/* Asset Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Asset Description</Label>
              <Textarea
                id="description"
                value={assetDescription}
                onChange={(e) => setAssetDescription(e.target.value)}
                required
              />
            </div>

            {/* Ownership Document - Only for Physical Assets */}
            {assetType === "Physical" && (
              <div className="space-y-2">
                <Label htmlFor="ownership-document">Ownership Document (PDF only)</Label>
                <Input
                  className='bg-slate-200'
                  id="ownership-document"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setOwnershipDocument(e.target.files?.[0] || null)}
                  required
                />
              </div>
            )}

            {/* Asset Images */}
            <div className="space-y-2">
              <Label htmlFor="images">Asset Images (Upload)</Label>
              <Input
                className='bg-slate-200'
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setAssetImages(e.target.files)}
              />
            </div>

            {/* Total Shares */}
            <div className="space-y-2">
              <Label htmlFor="total-shares">Total Shares (min: 100)</Label>
              <Input
                id="total-shares"
                type="number"
                min="100"
                value={totalShares}
                onChange={(e) => handleSharesChange(parseInt(e.target.value, 10))}
                required
              />
            </div>

            {/* Price Per Share */}
            <div className="space-y-2">
              <Label>Price Per Share ($)</Label>
              <p className="text-md ml-2">{pricePerShare.toFixed(2)}</p>
            </div>


            {/* Submit Button */}
            <Button type="submit">Tokenize Asset</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenizeAsset;
