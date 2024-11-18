import { database, auth, ref, get, child, set, push } from '@/hooks/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface OrderResponse {
    message: string;
    orderId: number;
    assetId: number;
    orderType: string;
    filledTrades: any[] | null ;
    pendingOrder: any | null;
}



const fetchFirebaseData = async (): Promise<{
    pendingOrders: any[];
    matchedOrders: any[];
    completedOrders: any[];
} | null> => {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (currentUser: User | null) => {
            if (currentUser) {
                try {
                    const userRef = ref(database, `orders/${currentUser.uid}`);
                    
                    const [pendingSnapshot, matchedSnapshot, completedSnapshot] = await Promise.all([
                        get(child(userRef, 'pendingOrders')),
                        get(child(userRef, 'MatchedOrders')),
                        get(child(userRef, 'CompletedOrders'))
                    ]);

                    const pendingOrders = pendingSnapshot.exists() 
                        ? Object.values(pendingSnapshot.val()) 
                        : [];
                    const matchedOrders = matchedSnapshot.exists() 
                        ? Object.values(matchedSnapshot.val()) 
                        : [];
                    const completedOrders = completedSnapshot.exists() 
                        ? Object.values(completedSnapshot.val()) 
                        : [];

                    resolve({ pendingOrders, matchedOrders, completedOrders });
                } catch (error) {
                    console.error('Error fetching Firebase data:', error);
                    reject(error);
                }
            } else {
                resolve(null);
            }
        });
    });
};

const handleBuyOrder = async (
    id: string,
    tradeAmount: string | number,
    currentPrice: number
): Promise<OrderResponse | null> => {
    if (!tradeAmount || isNaN(Number(tradeAmount))) {
        console.error('Invalid trade amount.');
        return null;
    }

    try {
        const requestBody = {
            owneraddress: "0x84aAF900942cC94A74b5A18CB012Ea8315aA6f19",
            assetId: id,
            shareAmount: Number(tradeAmount),
            pricePerShare: currentPrice,
        };

        const response = await fetch('http://localhost:8979/api/orders/buy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`Failed to place buy order: ${response.statusText}`);
        }

        const data: OrderResponse = await response.json();

        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.error('User not authenticated. Cannot save to Firebase.');
            return null;
        }

        const userUid = currentUser.uid;
        const userOrdersRef = ref(database, `orders/${userUid}`);

        // Save pending order details if present
        if (data.pendingOrder) {
            const pendingOrdersRef = child(userOrdersRef, 'pendingOrders');
            const newPendingOrderRef = push(pendingOrdersRef);
            await set(newPendingOrderRef, {
                ...data.pendingOrder,
                orderId: data.orderId,
                assetId: data.assetId,
                orderType: data.orderType,
                timestamp: Date.now(),
            });
            console.log('Pending order saved to Firebase.');
        }

        // Save filled trades with all details if present
        if (data.filledTrades && data.filledTrades.length > 0) {
            const matchedOrdersRef = child(userOrdersRef, 'MatchedOrders');
            for (const trade of data.filledTrades) {
                const newMatchedOrderRef = push(matchedOrdersRef);
                await set(newMatchedOrderRef, {
                    ...trade,
                    orderId: data.orderId,
                    assetId: data.assetId,
                    orderType: "buy",
                    timestamp: Date.now(),
                });
            }
            console.log('Filled trades saved to Firebase.');
        }

        return data;
    } catch (err) {
        console.error('Error placing buy order:', err);
        return null;
    }
};

const handleSellOrder = async (
    id: string,
    tradeAmount: string | number,
    currentPrice: number,
    userAddress: string
): Promise<void> => {
    if (!tradeAmount || isNaN(Number(tradeAmount))) {
        console.error('Invalid trade amount.');
        return;
    }

    const sellAmount = Number(tradeAmount);

    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.error('User not authenticated. Cannot check positions.');
            return;
        }

        const userUid = currentUser.uid;
        const matchedOrdersRef = child(ref(database), `orders/${userUid}/MatchedOrders`);
        const matchedSnapshot = await get(matchedOrdersRef);

        if (!matchedSnapshot.exists()) {
            console.error('No matched positions found for this user.');
            return;
        }

        const matchedOrders = Object.values(matchedSnapshot.val()) as any[];

        // Calculate total matched shares for this asset
        const totalMatchedShares = matchedOrders.reduce(
            (acc, order) => (order.assetId == id ? acc + order.shares : acc),
            0
        );

        if (sellAmount > totalMatchedShares) {
            console.error('Not enough assets to sell.');
            return;
        }

        const requestBody = {
            owneraddress: userAddress,
            assetId: id,
            shareAmount: sellAmount,
            pricePerShare: currentPrice,
        };

        const response = await fetch('http://localhost:8979/api/orders/sell', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`Failed to place sell order: ${response.statusText}`);
        }

        const data: OrderResponse = await response.json();
        console.log('Sell Order Response:', data);

        const userOrdersRef = ref(database, `orders/${userUid}`);

        // Save pending order details if present
        if (data.pendingOrder) {
            const pendingOrdersRef = child(userOrdersRef, 'pendingOrders');
            const newPendingOrderRef = push(pendingOrdersRef);
            await set(newPendingOrderRef, {
                ...data.pendingOrder,
                orderId: data.orderId,
                assetId: data.assetId,
                orderType: data.orderType,
                timestamp: Date.now(),
            });
            console.log('Pending order saved to Firebase.');
        }

        // Update matched shares and save filled trades
        if (data.filledTrades && data.filledTrades.length > 0) {
            let remainingSellAmount = sellAmount;

            // Deduct sold shares from matched orders
            const updatedMatchedOrders = matchedOrders.map((order) => {
                if (order.assetId == id && remainingSellAmount > 0) {
                    const sellableShares = Math.min(order.shares, remainingSellAmount);
                    remainingSellAmount -= sellableShares;
                    return {
                        ...order,
                        shares: order.shares - sellableShares,
                    };
                }
                return order;
            }).filter((order) => order.shares > 0);

            // Save updated matched orders
            await set(matchedOrdersRef, updatedMatchedOrders);
            console.log('Matched orders updated in Firebase.');

            // Save filled trades with all details
            const filledTradesRef = child(userOrdersRef, 'MatchedOrders');
            for (const trade of data.filledTrades) {
                const newMatchedOrderRef = push(filledTradesRef);
                await set(newMatchedOrderRef, {
                    ...trade,
                    orderId: data.orderId,
                    assetId: data.assetId,
                    orderType: "sell",
                    timestamp: Date.now(),
                });
            }
            console.log('Filled trades saved to Firebase.');
        }
    } catch (err) {
        console.error('Error placing sell order:', err);
    }
};





interface PriceData {
    timestamp: number;
    pricePerShare: number;
}

interface ProcessedPriceData {
    date: string;
    price: number;
}

const fetchPriceHistory = async (id: string): Promise<{ processedData: ProcessedPriceData[]; currentprice: number } | null> => {
    try {
        const response = await fetch(`http://localhost:8979/api/assets/${id}/price-history`);
        if (!response.ok) {
            throw new Error(`Failed to fetch price history: ${response.statusText}`);
        }

        const data: PriceData[] = await response.json();
        if (!data || data.length === 0) {
            console.warn('Price history data is empty.');
            return null;
        }

        const processedData: ProcessedPriceData[] = data.map((item) => ({
            date: new Date(item.timestamp).toLocaleTimeString(),
            price: item.pricePerShare * 1000,
        }));

        const currentprice = processedData[processedData.length - 1].price;

        return { processedData, currentprice };
    } catch (err) {
        console.error('Error fetching price history:', err);
        return null; // Return `null` if there’s an error
    }
};


export {fetchFirebaseData, fetchPriceHistory, handleBuyOrder, handleSellOrder}