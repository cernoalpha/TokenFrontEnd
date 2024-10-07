import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tokenizeAsset } from '@/services/assetService';

const TokenizeAsset: React.FC = () => {
  const [assetName, setAssetName] = useState<string>('');  
  const [assetValue, setAssetValue] = useState<string>(''); 
  const [assetDescription, setAssetDescription] = useState<string>(''); 
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newAsset = tokenizeAsset({
      name: assetName,
      value: parseFloat(assetValue),
      description: assetDescription 
    });
    navigate(`/asset/${newAsset.id}`); 
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
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name</Label>
              <Input
                id="name"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Asset Value ($)</Label>
              <Input
                id="value"
                type="number"
                value={assetValue}
                onChange={(e) => setAssetValue(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Asset Description</Label>
              <Input
                id="description"
                value={assetDescription}
                onChange={(e) => setAssetDescription(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Tokenize Asset</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenizeAsset;
