import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";


const PendingOrders = ({ id, activeOrders }: { id: string; activeOrders: any[] }) => {
    const [orders, setOrders] = useState(activeOrders || []);

    useEffect(() => {
        setOrders(activeOrders); 
    }, [activeOrders]);


    return (
        <div>
        <div className="flex flex-wrap gap-6 mt-5">
            {orders
                .filter((order) => order.assetId === id)
                .map((order) => (
                    <Card
                        key={order.orderId}
                        className="w-full sm:w-[280px] md:w-[300px] lg:w-[320px] xl:w-[350px] shadow-lg hover:shadow-xl transition duration-200 ease-in-out transform hover:scale-105"
                    >
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-gray-800">
                                Order #{order.orderId}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-700">
                                    <strong>Order Type:</strong> {order.orderType}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <strong>Price per Share:</strong> ${order.price}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <strong>Shares:</strong> {order.shares}
                                </p>
                                <p className="text-sm text-gray-500">
                                    <strong>Timestamp:</strong> {new Date(order.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
        </div>
    </div>
    
    );
};

export default PendingOrders;
