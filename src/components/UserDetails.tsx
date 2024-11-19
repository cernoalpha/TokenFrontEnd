import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "@/hooks/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

interface Asset {
    description: any;
    approved: boolean | null;
    id: string;
    name: string;
    value: number;
    totalShares: number;
    pricePerShare: number;
}

interface PendingOrder {
    shareAmount: number;
    timestamp: number;
    orderType: string;
    orderId: string;
    assetId: string;
    pricePerShare: number;
}

interface MatchedOrder {
    assetId: string;
    buyer: string;
    orderId: number;
    orderType: string;
    price: number;
    seller: string;
    shares: number;
    timestamp: number;
}


const UserDetails: React.FC<{ uid: string }> = ({ uid }) => {
    const [pendingOrders, setPendingOrders] = useState<PendingOrder[] | null>(null);
    const [matchedOrders, setMatchedOrders] = useState<MatchedOrder[] | null>(null);
    const [assets, setAssets] = useState<Asset[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate()

    useEffect(() => {

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
                setMatchedOrders(Object.values(snapshot.val()));
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

    function handleButtonClick(assetId: string) {
        navigate(`${assetId}/trade`, { replace: true })
    }

    return (
        <div className="space-y-6">
            {/* Pending Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>Pending positions</CardTitle>
                </CardHeader>
                <CardContent>
                    {pendingOrders && pendingOrders.length > 0 ? (
                        <div className="space-y-4">
                            {pendingOrders.map((order, index) => (
                                <div key={index} className="p-4 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition duration-200">
                                    <div className="flex justify-between items-center">
                                        <div className="text-lg font-semibold text-gray-800">
                                            <strong>Order ID:</strong> {order.orderId}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">{new Date(order.timestamp).toLocaleString()}</span>
                                            <span className={`px-2 py-1 text-xs rounded-full ${order.orderType === 'buy' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                                {order.orderType}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-600">
                                        <strong>Price:</strong> ${order.pricePerShare} | <strong>Amount:</strong> {order.shareAmount} Shares
                                    </div>
                                    <div className="mt-4">
                                        <Button
                                            onClick={() => handleButtonClick(order.assetId)}
                                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        >
                                            GoTo Order
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No pending orders available.</p>
                    )}
                </CardContent>
            </Card>

            {/* Matched Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>Active positions</CardTitle>
                </CardHeader>
                <CardContent>
    {matchedOrders && matchedOrders.length > 0 ? (
        <div className="space-y-4">
            {matchedOrders.map((order, index) => (
                <div
                    key={index}
                    className="p-4 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition duration-200"
                >
                    <div className="flex justify-between items-center">
                        <div className="text-lg font-semibold text-gray-800">
                            <strong>Order ID:</strong> {order.orderId}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                                {new Date(order.timestamp).toLocaleString()}
                            </span>
                            <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                    order.orderType === "buy"
                                        ? "bg-green-200 text-green-800"
                                        : "bg-red-200 text-red-800"
                                }`}
                            >
                                {order.orderType}
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                        <p>
                            <strong>Price:</strong> ${order.price} |{" "}
                            <strong>Shares:</strong> {order.shares}
                        </p>
                    </div>
                    <div className="mt-4">
                        <Button
                            onClick={() => handleButtonClick(order.assetId)}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            Take Action
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    ) : (
        <p className="text-center text-gray-500">No matched orders available.</p>
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
                        <ul className="list-none p-0">
                            {assets.map((asset, index) => (
                                <li
                                    key={index}
                                    className="flex justify-between items-center bg-gray-100 p-4 mb-2 rounded shadow-sm"
                                >
                                    <div>
                                        <div className="font-bold text-lg">{asset.name}</div>
                                        <div className="text-gray-600">
                                            <span className="font-medium">Value:</span> ${asset.value}
                                        </div>
                                        <div className="text-gray-500">
                                            <span className="font-medium">Description:</span>{" "}
                                            {asset.description.length > 50
                                                ? `${asset.description.substring(0, 50)}...`
                                                : asset.description}
                                        </div>
                                    </div>
                                    <div
                                        className={`text-sm font-semibold px-3 py-1 rounded-full ${asset.approved === true
                                            ? "bg-green-100 text-green-600"
                                            : asset.approved === false
                                                ? "bg-red-100 text-red-600"
                                                : "bg-yellow-100 text-yellow-600"
                                            }`}
                                    >
                                        {asset.approved === true
                                            ? "Approved"
                                            : asset.approved === false
                                                ? "Not Approved"
                                                : "Under Process"}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500">No assets available.</p>
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
