import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { database, ref as databaseRef, set, push, auth, storage } from "@/hooks/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const TokenizeAsset: React.FC = () => {
  const [assetName, setAssetName] = useState<string>("");
  const [assetValue, setAssetValue] = useState<string>("");
  const [assetDescription, setAssetDescription] = useState<string>("");
  const [assetType, setAssetType] = useState<string>("Physical");
  const [ownershipDocument, setOwnershipDocument] = useState<File | null>(null);
  const [assetImages, setAssetImages] = useState<FileList | null>(null);
  const [pricePerShare, setPricePerShare] = useState<number>(0);
  const navigate = useNavigate();

  const updatePricePerShare = () => {
    const value = parseFloat(assetValue);
    if (value > 0) {
      setPricePerShare(value / 1000);
    } else {
      setPricePerShare(0);
    }
  };

  const handleValueChange = (value: string) => {
    setAssetValue(value);
    updatePricePerShare();
  };

  const validateForm = () => {
    if (!assetName || !assetValue || !assetDescription || !pricePerShare) {
      alert("Please fill in all required fields.");
      return false;
    }
    if (assetType === "Physical" && !ownershipDocument) {
      alert("Ownership document is required for physical assets.");
      return false;
    }
    if (assetImages && assetImages.length === 0) {
      alert("At least one image must be uploaded.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    const userUID = auth.currentUser?.uid;
  
    if (!userUID) {
      alert("You must be logged in to tokenize an asset.");
      return;
    }
  
    const userAssetsRef = databaseRef(database, `assets/${userUID}`);
    const newAssetRef = push(userAssetsRef);
  
    const assetData: {
      name: string;
      value: string;
      description: string;
      type: string;
      totalShares: string;
      pricePerShare: number;
      createdAt: string;
      ownershipDocumentURL?: string;
      assetImages?: string[];
    } = {
      name: assetName,
      value: assetValue,
      description: assetDescription,
      type: assetType,
      totalShares: "1000",
      pricePerShare,
      createdAt: new Date().toISOString(),
    };
  
    try {
      // Upload ownership document
      if (ownershipDocument) {
        const ownershipDocPath = `user_assets/${userUID}/${newAssetRef.key}/ownershipDocument/${ownershipDocument.name}`;
        const ownershipDocStorageRef = storageRef(storage, ownershipDocPath);
        const ownershipSnapshot = await uploadBytes(ownershipDocStorageRef, ownershipDocument);
        const ownershipDocumentURL = await getDownloadURL(ownershipSnapshot.ref);
        assetData.ownershipDocumentURL = ownershipDocumentURL;
      }
  
      // Upload images
      if (assetImages?.length) {
        const imageURLs: string[] = [];
        for (const file of Array.from(assetImages)) {
          const imagePath = `user_assets/${userUID}/${newAssetRef.key}/images/${file.name}`;
          const imageStorageRef = storageRef(storage, imagePath);
          const imageSnapshot = await uploadBytes(imageStorageRef, file);
          const imageURL = await getDownloadURL(imageSnapshot.ref);
          imageURLs.push(imageURL);
        }
        assetData.assetImages = imageURLs; 
      }
  
      await set(newAssetRef, assetData);
  
      // Navigate to asset page
      navigate(`/login}`);
    } catch (error) {
      console.error("Error creating asset:", error);
      alert("Error creating asset. Please try again.");
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
                step="0.01"
                min="1"
                value={assetValue}
                onChange={(e) => handleValueChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Asset Description</Label>
              <Textarea
                id="description"
                value={assetDescription}
                onChange={(e) => setAssetDescription(e.target.value)}
                required
              />
            </div>

            {assetType === "Physical" && (
              <div className="space-y-2">
                <Label htmlFor="ownership-document">Ownership Document</Label>
                <Input
                  id="ownership-document"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setOwnershipDocument(e.target.files?.[0] || null)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="images">Asset Images</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setAssetImages(e.target.files)}
              />
            </div>

            <div className="space-y-2">
              <Label>Price Per Share</Label>
              <p>{pricePerShare.toFixed(2)}</p>
            </div>

            <Button type="submit">Tokenize Asset</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenizeAsset;
