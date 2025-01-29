import { Users, MessageSquare, TrendingUp, AlertCircle } from "lucide-react";

const OverviewCards = () => {
  const cards = [
    {
      title: "Total Leads",
      value: "1,234",
      icon: Users,
      change: "+12%",
      positive: true,
    },
    {
      title: "Active Conversations",
      value: "89",
      icon: MessageSquare,
      change: "+5%",
      positive: true,
    },
    {
      title: "Positive Sentiment",
      value: "76%",
      icon: TrendingUp,
      change: "-2%",
      positive: false,
    },
    {
      title: "Needs Attention",
      value: "23",
      icon: AlertCircle,
      change: "+8%",
      positive: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white p-6 rounded-lg border border-gray-200 animate-fade-in"
        >
          <div className="flex items-center justify-between mb-4">
            <card.icon className="w-6 h-6 text-primary-500" />
            <span
              className={`text-sm ${
                card.positive ? "text-sentiment-positive" : "text-sentiment-negative"
              }`}
            >
              {card.change}
            </span>
          </div>
          <h3 className="text-gray-600 text-sm mb-2">{card.title}</h3>
          <p className="text-2xl font-semibold">{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default OverviewCards;