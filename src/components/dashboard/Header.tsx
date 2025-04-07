import { Bell, Search } from "lucide-react";

const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search interactions, leads..."
          className="bg-transparent outline-none flex-1"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
        </button>
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      </div>
    </header>
  );
};

export default Header;