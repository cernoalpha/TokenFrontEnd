import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams } from 'react-router-dom';
import { getWalletAddress } from "@/components/GetWalletAddress";
import Chart from '@/components/Chart';
import {
    fetchFirebaseData,
    fetchPriceHistory,
    handleBuyOrder,
    handleSellOrder
} from "@/hooks/Trade";

interface ProcessedPriceData {
    date: string;
    price: number;
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
    const [userAddress, setUserAddress] = useState<string | null>(null);

    // Fetch wallet address
    const fetchWalletAddress = async () => {
        const address = await getWalletAddress();
        if (address) setUserAddress(address);
    };

    const fetchData = async () => {
        try {
            // Fetch price history
            const priceData = await fetchPriceHistory(id);
            if (priceData) {
                setPriceHistory(priceData.processedData);
                setCurrentPrice(priceData.currentprice);
            }

            // Fetch user orders
            const firebaseData = await fetchFirebaseData();
            if (firebaseData) {
                setPendingOrders(firebaseData.pendingOrders);
                setMatchedOrders(firebaseData.matchedOrders);
                setCompletedOrders(firebaseData.completedOrders);

                // Calculate user's position
                const position = firebaseData.matchedOrders.reduce(
                    (acc, order) => (order.assetId === id ? acc + order.shareAmount : acc),
                    0
                );
                setPosition(position);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to fetch data. Please try again later.');
        }
    };

    // Handle Buy Order
    const handleBuy = async () => {
        setError(null);
        try {
            const response = await handleBuyOrder(id, tradeAmount, currentPrice);
            if (response) {
                setPendingOrders((prev) => [
                    ...prev,
                    ...(response.pendingOrder ? [response.pendingOrder] : []),
                ]);
                setMatchedOrders((prev) => [
                    ...prev,
                    ...(response.filledTrades || []),
                ]);
                setTradeAmount(''); // Reset input
                fetchData(); // Refresh user data
            }
        } catch (err) {
            console.error('Error placing buy order:', err);
            setError('Failed to place buy order.');
        }
    };

    // Handle Sell Order
    const handleSell = async () => {
        setError(null);
        try {
            if (!userAddress) {
                setError('User address not available.');
                return;
            }

            await handleSellOrder(id, tradeAmount, currentPrice, userAddress);
            setTradeAmount(''); // Reset input
            fetchData(); // Refresh user data
        } catch (err) {
            console.error('Error placing sell order:', err);
            setError('Failed to place sell order.');
        }
    };

    // Initial fetch on mount
    useEffect(() => {
        fetchWalletAddress();
        fetchData();

        const interval = setInterval(() => {
            fetchPriceHistory(id).then((priceData) => {
                if (priceData) {
                    setPriceHistory(priceData.processedData);
                    setCurrentPrice(priceData.currentprice);
                }
                console.log("price Updated")
            }).catch((err) => {
                console.error('Error updating price history:', err);
            });
        }, 60000); 

        return () => clearInterval(interval); 

    }, [id]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Trading Asset {id}</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Price History Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Price History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Chart priceHistory={priceHistory} />
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
                                <Button onClick={handleBuy} className="flex-1">
                                    Buy
                                </Button>
                                <Button onClick={handleSell} className="flex-1" variant="outline">
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
