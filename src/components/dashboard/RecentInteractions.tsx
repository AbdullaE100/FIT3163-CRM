import { MessageSquare, Mail, Phone } from "lucide-react";

const RecentInteractions = () => {
  const interactions = [
    {
      id: 1,
      name: "John Smith",
      type: "message",
      content: "Thanks for the quick response!",
      time: "2h ago",
      sentiment: "positive",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      type: "email",
      content: "I need help with the integration...",
      time: "4h ago",
      sentiment: "neutral",
    },
    {
      id: 3,
      name: "Mike Brown",
      type: "call",
      content: "Call duration: 15 minutes",
      time: "6h ago",
      sentiment: "negative",
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "message":
        return MessageSquare;
      case "email":
        return Mail;
      case "call":
        return Phone;
      default:
        return MessageSquare;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-6">Recent Interactions</h2>
      <div className="space-y-4">
        {interactions.map((interaction) => {
          const Icon = getIcon(interaction.type);
          return (
            <div
              key={interaction.id}
              className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Icon className="w-5 h-5 text-gray-400 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium">{interaction.name}</h3>
                  <span className="text-sm text-gray-500">{interaction.time}</span>
                </div>
                <p className="text-sm text-gray-600">{interaction.content}</p>
              </div>
              <div className={`w-2 h-2 rounded-full mt-2 sentiment-${interaction.sentiment}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentInteractions;