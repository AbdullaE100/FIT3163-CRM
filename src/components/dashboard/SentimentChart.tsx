import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', positive: 65, neutral: 25, negative: 10 },
  { name: 'Tue', positive: 59, neutral: 30, negative: 11 },
  { name: 'Wed', positive: 80, neutral: 15, negative: 5 },
  { name: 'Thu', positive: 71, neutral: 20, negative: 9 },
  { name: 'Fri', positive: 56, neutral: 35, negative: 9 },
  { name: 'Sat', positive: 55, neutral: 30, negative: 15 },
  { name: 'Sun', positive: 40, neutral: 45, negative: 15 },
];

const SentimentChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-6">Sentiment Trends</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="positive" stroke="#10B981" strokeWidth={2} />
            <Line type="monotone" dataKey="neutral" stroke="#6B7280" strokeWidth={2} />
            <Line type="monotone" dataKey="negative" stroke="#EF4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SentimentChart;