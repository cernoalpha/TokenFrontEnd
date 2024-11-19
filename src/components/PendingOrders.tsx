import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, database, get, ref, set } from "@/hooks/firebase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import axios from "axios";

const PendingOrders = ({ id, pendingOrders }: { id: string; pendingOrders: any[] }) => {
    const [orders, setOrders] = useState(pendingOrders || []);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    useEffect(() => {
        setOrders(pendingOrders);
    }, [pendingOrders]);
    const handleButtonClick = async (orderId: number, assetId: string, orderType: string) => {
        const user = auth.currentUser;

        if (!user) {
            console.error("User not authenticated");
            return;
        }

        const userId = user.uid;

        try {
            // Call the backend API
            const response = await axios.post("http://localhost:8979/api/orders/cancel", {
                orderId,
                assetId,
                orderType,
            });

            if (response.status === 200) {
                console.log("API Response:", response.data.message);

                // Proceed to Firebase operations if API call succeeds
                const ordersRef = ref(database, `orders/${userId}/pendingOrders`);
                const snapshot = await get(ordersRef);

                if (!snapshot.exists()) {
                    console.error("No pending orders found.");
                    return;
                }

                const pendingOrdersData = snapshot.val();
                const orderKey = Object.keys(pendingOrdersData).find(
                    (key) =>
                        pendingOrdersData[key].orderId === orderId &&
                        pendingOrdersData[key].assetId === assetId
                );

                if (orderKey) {
                    await set(ref(database, `orders/${userId}/pendingOrders/${orderKey}`), null);

                    // Update state to reflect changes
                    setOrders((prevOrders) =>
                        prevOrders.filter((order) => order.orderId !== orderId)
                    );

                    setAlertMessage(response.data.message);
                    setAlertVisible(true);
                    setTimeout(() => setAlertVisible(false), 3000);
                } else {
                    console.error("No matching order found in Firebase.");
                }
            } else {
                console.error("Error from API:", response.data.message);
            }
        } catch (error) {
            console.error("Error cancelling the order:", error);
        }
    };

    return (
        <div>
            {/* Alert for Success */}
            {alertVisible && (
                <Alert className="mb-4">
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{alertMessage}</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-wrap gap-4 mt-8">
                {orders
                    .filter((order) => order.assetId == id)
                    .map((order) => (
                        <Card
                            key={order.orderId}
                            className="w-[300px] shadow-lg"
                        >
                            <CardHeader>
                                <CardTitle>Order #{order.orderId}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm text-gray-700">
                                    <p>
                                        <strong>Order Type:</strong>
                                        <span className={`ml-2 text-${order.orderType === 'buy' ? 'green' : 'red'}-600`}>
                                            {order.orderType}
                                        </span>
                                    </p>
                                    <p>
                                        <strong>Price:</strong> ${order.pricePerShare/1000}
                                    </p>
                                    <p>
                                        <strong>Amount:</strong> {order.shareAmount} Shares
                                    </p>
                                    <p>
                                        <strong>Timestamp:</strong> {new Date(order.timestamp).toLocaleString()}
                                    </p>
                                </div>

                                <Button
                                    onClick={() => handleButtonClick(order.orderId, order.assetId, order.orderType)}
                                    className="mt-4 w-full px-4 py-2 text-white rounded-md bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                                >
                                    Cancel Order
                                </Button>
                            </CardContent>

                        </Card>
                    ))}
            </div>
        </div>
    );
};

export default PendingOrders;
