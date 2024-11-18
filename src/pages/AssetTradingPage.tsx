import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useParams } from 'react-router-dom';

interface PriceData {
    pricePerShare: number;
    timestamp: number;
}

interface ProcessedPriceData {
    date: string;
    price: number;
}

const fetchPriceHistory = async (id: string): Promise<PriceData[]> => {
    try {
        const response = await fetch(`http://localhost:8979/api/assets/${id}/price-history`);
        if (!response.ok) {
            throw new Error(`Failed to fetch price history: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const AssetTradingPage: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    if (!id) {
        return <div>No asset ID provided.</div>;
    }

    const [priceHistory, setPriceHistory] = useState<ProcessedPriceData[]>([]);
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [position, setPosition] = useState<number>(0);
    const [tradeAmount, setTradeAmount] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const processPriceData = (data: PriceData[]): ProcessedPriceData[] => {
        return data.map((item) => ({
            date: new Date(item.timestamp).toLocaleTimeString(),
            price: item.pricePerShare * 1000,
        }));
    };

    const loadPriceHistory = async () => {
        try {
            setError(null);
            const data = await fetchPriceHistory(id);
            const processedData = processPriceData(data);
            setPriceHistory(processedData);
            setCurrentPrice(processedData[processedData.length - 1].price);
        } catch (err) {
            setError("Error fetching price history. Please try again.");
        }
    };

    useEffect(() => {
        loadPriceHistory();
        const interval = setInterval(loadPriceHistory, 60000);
        return () => clearInterval(interval);
    }, [id]);

    const handleBuy = () => {
        if (tradeAmount && !isNaN(parseFloat(tradeAmount))) {
            setPosition(prev => prev + parseFloat(tradeAmount));
            setTradeAmount('');
        }
    };

    const handleSell = () => {
        if (tradeAmount && !isNaN(parseFloat(tradeAmount)) && position >= parseFloat(tradeAmount)) {
            setPosition(prev => prev - parseFloat(tradeAmount));
            setTradeAmount('');
        }
    };

    const minPrice = Math.min(...priceHistory.map(d => d.price));
    const maxPrice = Math.max(...priceHistory.map(d => d.price));
    const yAxisDomain = [minPrice * 0.95, maxPrice * 1.05];

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
                                    domain={yAxisDomain}
                                    tickFormatter={(value) => `$${(value / 1000).toFixed(2)}`}
                                />
                                <Tooltip
                                    formatter={(value: number) => [`$${(value / 1000).toFixed(2)}`, 'Price']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="price"
                                    stroke="#8884d8"
                                    dot={false}
                                />
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
                                <Button onClick={handleBuy} className="flex-1">Buy</Button>
                                <Button onClick={handleSell} className="flex-1" variant="outline">Sell</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AssetTradingPage;
