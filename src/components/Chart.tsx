import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


interface ProcessedPriceData {
    date: string;
    price: number;
}

interface ChartProps {
    priceHistory: ProcessedPriceData[];
}



const Chart = ({ priceHistory }: ChartProps) => {
    return(
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
    )
}

export default Chart