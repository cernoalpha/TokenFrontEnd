import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useParams } from 'react-router-dom';
import { database, ref, get, child, push, set } from '@/hooks/firebase';

interface PriceData {
    pricePerShare: number;
    timestamp: number;
}

interface ProcessedPriceData {
    date: string;
    price: number;
}

interface OrderResponse {
    message: string;
    orderId: number;
    assetId: number;
    orderType: string;
    filledTrades: any[];
    pendingOrder: any | null;
}

const AssetTradingPage: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    if (!id) {
        return <div>No asset ID provided.</div>;
    }

    const [priceHistory, setPriceHistory] = useState<ProcessedPriceData[]>([]);
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [position, setPosition] = useState<number>(0); 
    const [tradeAmount, setTradeAmount] = useState<string>('');
    const [pendingOrders, setPendingOrders] = useState<any[]>([]);
    const [matchedOrders, setMatchedOrders] = useState<any[]>([]);
    const [completedOrders, setCompletedOrders] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [uid, setUid] = useState<string>(''); 

    const fetchFirebaseData = async () => {
        try {
            const userRef = ref(database, `orders/${uid}`);
            const pending = await get(child(userRef, 'pendingOrders'));
            const matched = await get(child(userRef, 'MatchedOrders'));
            const completed = await get(child(userRef, 'CompletedOrders'));

            setPendingOrders(pending.exists() ? Object.values(pending.val()) : []);
            setMatchedOrders(matched.exists() ? Object.values(matched.val()) : []);
            setCompletedOrders(completed.exists() ? Object.values(completed.val()) : []);
        } catch (err) {
            console.error('Error fetching Firebase data:', err);
            setError('Failed to fetch order data.');
        }
    };

    const fetchPriceHistory = async () => {
        try {
            const response = await fetch(`/api/assets/${id}/price-history`);
            if (!response.ok) {
                throw new Error(`Failed to fetch price history: ${response.statusText}`);
            }
            const data: PriceData[] = await response.json();
            const processedData = data.map((item) => ({
                date: new Date(item.timestamp).toLocaleTimeString(),
                price: item.pricePerShare * 1000,
            }));
            setPriceHistory(processedData);
            setCurrentPrice(processedData[processedData.length - 1].price);
        } catch (err) {
            console.error('Error fetching price history:', err);
            setError('Failed to fetch price history.');
        }
    };

    const handleBuyOrder = async () => {
        if (!tradeAmount || isNaN(Number(tradeAmount))) {
            setError('Invalid trade amount.');
            return;
        }

        try {
            const requestBody = {
                owneraddress: uid,
                assetId: id,
                shareAmount: Number(tradeAmount),
                pricePerShare: currentPrice,
            };

            const response = await fetch('/api/orders/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`Failed to place buy order: ${response.statusText}`);
            }

            const data: OrderResponse = await response.json();
            setPendingOrders((prev) => [...prev, data.pendingOrder]);
            setError(null);
        } catch (err) {
            console.error('Error placing buy order:', err);
            setError('Failed to place buy order.');
        }
    };

    const handleSellOrder = async () => {
        if (!tradeAmount || isNaN(Number(tradeAmount))) {
            setError('Invalid trade amount.');
            return;
        }

        const sellAmount = Number(tradeAmount);
        const matchedPosition = matchedOrders.reduce(
            (acc, order) => (order.assetId === id ? acc + order.shareAmount : acc),
            0
        );

        if (sellAmount > matchedPosition) {
            setError('Not enough assets to sell.');
            return;
        }

        try {
            const requestBody = {
                owneraddress: uid,
                assetId: id,
                shareAmount: sellAmount,
                pricePerShare: currentPrice,
            };

            const response = await fetch('/api/orders/sell', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`Failed to place sell order: ${response.statusText}`);
            }

            const data: OrderResponse = await response.json();
            setMatchedOrders((prev) =>
                prev.map((order) =>
                    order.orderId === data.pendingOrder?.orderId
                        ? { ...order, shareAmount: order.shareAmount - sellAmount }
                        : order
                )
            );
            setError(null);
        } catch (err) {
            console.error('Error placing sell order:', err);
            setError('Failed to place sell order.');
        }
    };

    useEffect(() => {
        fetchFirebaseData();
        fetchPriceHistory();
    }, [id]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Trading Asset {id}</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Price History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={priceHistory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis
                                    tickFormatter={(value) => `$${(value / 1000).toFixed(2)}`}
                                />
                                <Tooltip
                                    formatter={(value: number) => [`$${(value / 1000).toFixed(2)}`, 'Price']}
                                />
                                <Line type="monotone" dataKey="price" stroke="#8884d8" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Trading</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">Current Price: ${(currentPrice / 1000).toFixed(2)}</p>
                        <p className="mb-4">Your Position: {position} units</p>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="tradeAmount">Amount</Label>
                                <Input
                                    id="tradeAmount"
                                    type="number"
                                    value={tradeAmount}
                                    onChange={(e) => setTradeAmount(e.target.value)}
                                    placeholder="Enter amount"
                                />
                            </div>
                            <div className="flex space-x-2">
                                <Button onClick={handleBuyOrder} className="flex-1">
                                    Buy
                                </Button>
                                <Button onClick={handleSellOrder} className="flex-1" variant="outline">
                                    Sell
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AssetTradingPage;
