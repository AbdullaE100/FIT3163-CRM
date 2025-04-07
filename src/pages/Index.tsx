import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import OverviewCards from "../components/dashboard/OverviewCards";
import SentimentChart from "../components/dashboard/SentimentChart";
import RecentInteractions from "../components/dashboard/RecentInteractions";
import FileUpload from "../components/dashboard/FileUpload";

const Index = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 space-y-6">
          <OverviewCards />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SentimentChart />
            <RecentInteractions />
          </div>
          <FileUpload />
        </main>
      </div>
    </div>
  );
};

export default Index;