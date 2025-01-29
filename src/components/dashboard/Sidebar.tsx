import { Home, MessageSquare, BarChart2, Users, Settings, Upload, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: MessageSquare, label: "Interactions", path: "/interactions" },
    { icon: BarChart2, label: "Analytics", path: "/analytics" },
    { icon: Users, label: "Leads", path: "/leads" },
    { icon: Upload, label: "Upload Data", path: "/upload" },
    { icon: FileText, label: "Interview Logs", path: "/interviews" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-600">FIT3163 Group</h1>
      </div>
      <nav className="flex-1 px-4">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;