import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { auth, database, get, ref, set, storage } from "@/hooks/firebase";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
import UserDetails from "@/components/UserDetails";
import Web3 from "web3";
import Loader from "@/components/Loader";

const googleProvider = new GoogleAuthProvider();

const LoginPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDetailsRequired, setIsDetailsRequired] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      setUser(currentUser);
      if (currentUser) {
        checkUserDetails(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const checkUserDetails = async (uid: string) => {
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);
    if (!snapshot.exists()) {
      setIsDetailsRequired(true);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all fields
    if (!fullName || !address || !idFile || !walletAddress) {
      setError("Please fill out all required fields and connect your wallet.");
      return;
    }

    try {
      setIsLoading(true); // Start loading spinner

      const storagePath = `id_uploads/${user?.uid}/${idFile.name}`;
      const fileRef = storageRef(storage, storagePath);
      const snapshot = await uploadBytes(fileRef, idFile);
      const fileURL = await getDownloadURL(snapshot.ref);

      const userDetails = {
        fullName,
        address,
        idURL: fileURL,
        walletAddress,
      };

      await set(ref(database, `users/${user?.uid}`), userDetails);
      setIsDetailsRequired(false);
      setError(null); // Clear error
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false); // Stop loading spinner
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        setWalletAddress("0x84aAF900942cC94A74b5A18CB012Ea8315aA6f19");

        if (user) {
          // Update wallet address in Firebase
          const userRef = ref(database, `users/${user.uid}/walletAddress`);
          await set(userRef, accounts[0]);
        }
      } catch (err) {
        setError("User denied account access");
      }
    } else {
      setError("MetaMask not installed. Please install MetaMask!");
    }
  };

  if (isDetailsRequired) {
    return (
      <Card className="w-[350px] mx-auto mt-10">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>Provide additional details to finish setting up your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idFile">Upload ID</Label>
              <Input
                id="idFile"
                type="file"
                onChange={(e) => setIdFile(e.target.files ? e.target.files[0] : null)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="walletAddress">Connect Wallet</Label>
              <Button onClick={connectWallet} type="button" className="w-full">
                {walletAddress
                  ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                  : "Connect Wallet"}
              </Button>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader /> : "Submit"}
            </Button>
          </form>
        </CardContent>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </Card>
    );
  }

  if (user) {
    return (
      <div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome, {user.displayName}</CardTitle>
            <CardDescription>You are now signed in.</CardDescription>
          </CardHeader>
          <CardContent>
            <img src={user.photoURL || ""} alt="Profile" className="w-20 h-20 rounded-full mx-auto mb-4" />
            <p className="text-center">{user.email}</p>
          </CardContent>
          <CardFooter>
          </CardFooter>
        </Card>
        <UserDetails uid={user.uid} />
      </div>
    );
  }

  return (
    <Card className="w-[350px] mx-auto mt-10">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGoogleSignIn} className="w-full">
          Sign in with Google
        </Button>
      </CardContent>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </Card>
  );
};

export default LoginPage;
