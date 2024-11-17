import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "@/hooks/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Asset {
  id: string;
  name: string;
  value: number;
  totalShares: number;
  pricePerShare: number;
}

interface PendingOrder {
  orderId: string;
  assetId: string;
  pricePerShare: number;
}

const UserDetails: React.FC<{ uid: string }> = ({ uid }) => {
  const [fullName, setFullName] = useState<string | null>(null);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[] | null>(null);
  const [matchedOrders, setMatchedOrders] = useState<Record<string, any> | null>(null);
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch User Details
    const userRef = ref(database, `users/${uid}`);
    onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setFullName(userData.fullName || "No name provided");
      } else {
        setFullName(null);
      }
    }, (error) => setError(error.message));

    // Fetch Pending Orders
    const pendingOrdersRef = ref(database, `orders/${uid}/pendingOrders`);
    onValue(pendingOrdersRef, (snapshot) => {
      if (snapshot.exists()) {
        setPendingOrders(Object.values(snapshot.val()));
      } else {
        setPendingOrders(null);
      }
    }, (error) => setError(error.message));

    // Fetch Matched Orders
    const matchedOrdersRef = ref(database, `orders/${uid}/MatchedOrders`);
    onValue(matchedOrdersRef, (snapshot) => {
      if (snapshot.exists()) {
        setMatchedOrders(snapshot.val());
      } else {
        setMatchedOrders(null);
      }
    }, (error) => setError(error.message));

    // Fetch User Assets
    const assetsRef = ref(database, `assets/${uid}`);
    onValue(assetsRef, (snapshot) => {
      if (snapshot.exists()) {
        setAssets(Object.values(snapshot.val()));
      } else {
        setAssets(null);
      }
    }, (error) => setError(error.message));
  }, [uid]);

  return (
    <div className="space-y-6">

      {/* Pending Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingOrders ? (
            <ul className="list-disc pl-4">
              {pendingOrders.map((order, index) => (
                <li key={index}>
                  <strong>Order ID:</strong> {order.orderId} | <strong>Asset ID:</strong> {order.assetId} | <strong>Price/Share:</strong> ${order.pricePerShare}
                </li>
              ))}
            </ul>
          ) : (
            <p>No pending orders available.</p>
          )}
        </CardContent>
      </Card>

      {/* Matched Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Matched Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {matchedOrders ? (
            <ul className="list-disc pl-4">
              {Object.entries(matchedOrders).map(([key, value]) => (
                <li key={key}>
                  <strong>Order ID:</strong> {key} | <strong>Details:</strong> {JSON.stringify(value)}
                </li>
              ))}
            </ul>
          ) : (
            <p>No matched orders available.</p>
          )}
        </CardContent>
      </Card>

      {/* User Assets */}
      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
        </CardHeader>
        <CardContent>
          {assets ? (
            <ul className="list-disc pl-4">
              {assets.map((asset, index) => (
                <li key={index}>
                  <strong>Name:</strong> {asset.name} | <strong>Value:</strong> ${asset.value} | <strong>Price/Share:</strong> ${asset.pricePerShare} | <strong>Total Shares:</strong> {asset.totalShares}
                </li>
              ))}
            </ul>
          ) : (
            <p>No assets available.</p>
          )}
        </CardContent>
      </Card>

      {/* Error Handling */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default UserDetails;
