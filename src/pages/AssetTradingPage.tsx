import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useParams } from 'react-router-dom';
import { useAsset } from '@/services/assetService';

interface PriceData {
    date: string;
    price: number;
}

// Corrected function to generate mock price history
const generatePriceHistory = (initialValue: number): PriceData[] => {
    const data: PriceData[] = [];
    const amplitude = initialValue * 0.1; 
    const frequency = 0.2;
    const phaseShift = Math.random() * Math.PI;
    for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const sineValue = Math.sin(frequency * i + phaseShift) * amplitude;
        const randomFactor = (Math.random() - 0.5) * amplitude * 0.2;
        const price = initialValue + sineValue + randomFactor;

        data.push({
            date: date.toISOString().split('T')[0],
            price: Math.max(0, price), 
        });
    }
    return data;
};

const AssetTradingPage: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    if (!id) {
        return <div>No asset ID provided.</div>; 
    }
    const asset = useAsset(id); 
    const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [position, setPosition] = useState<number>(0);
    const [tradeAmount, setTradeAmount] = useState<string>('');

    useEffect(() => {
        if (asset) {
            const history = generatePriceHistory(asset.value);
            setPriceHistory(history);
            setCurrentPrice(history[history.length - 1].price);
        }
    }, [asset]);

    useEffect(() => {
        if (currentPrice === 0) return;

        const interval = setInterval(() => {
            const newPrice = currentPrice + (Math.random() - 0.5) * currentPrice * 0.02; 
            setCurrentPrice(newPrice);
            setPriceHistory(prev => [
                ...prev.slice(1),
                { date: new Date().toISOString().split('T')[0], price: newPrice }
            ]);
        }, 5000);

        return () => clearInterval(interval);
    }, [currentPrice]);

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

    if (!asset) {
        return <div>Loading asset data...</div>;
    }

    const minPrice = Math.min(...priceHistory.map(d => d.price));
    const maxPrice = Math.max(...priceHistory.map(d => d.price));
    const yAxisDomain = [minPrice * 0.95, maxPrice * 1.05]; 

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Trading {asset.name}</h1>
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
                                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                                />
                                <Tooltip 
                                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
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
                        <p className="mb-4">Current Price: ${currentPrice.toFixed(2)}</p>
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