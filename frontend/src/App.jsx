import { useState, useEffect } from "react";
import MapView from "./components/MapView";
import ReportForm from "./components/ReportForm";
import ReportsList from "./components/ReportsList";
import { fetchReports } from "./api/reports";
import { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, RefreshCw, Menu, MapPin, X } from "lucide-react";

function App() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    loadReports();

    // Force a resize event to help the map render correctly
    window.dispatchEvent(new Event("resize"));

    // Additional resize event after a delay to ensure map renders properly
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await fetchReports();
      setReports(data);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportAdded = (newReport) => {
    setReports((prevReports) => [newReport, ...prevReports]);
    setIsFormOpen(false);
  };

  const toggleForm = () => {
    setIsFormOpen((prev) => !prev);
    if (isSidebarOpen) setIsSidebarOpen(false);
    setSelectedReport(null);
  };

  const handleReportSelect = (report) => {
    setSelectedReport(report);
    setIsFormOpen(true);
    if (isSidebarOpen) setIsSidebarOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary p-1 rounded-full">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">PulsePoint</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="hidden md:flex">
              {reports.length} Reports
            </Badge>

            <Button
              variant="ghost"
              size="icon"
              onClick={loadReports}
              disabled={loading}
              aria-label="Refresh reports"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 relative">
        {/* Map View - always visible and fills the screen */}
        <div className="h-full w-full">
          <MapView
            reports={reports}
            loading={loading}
            onReportSelect={handleReportSelect}
          />
        </div>

        {/* Floating action button - always visible */}
        <motion.div
          className="absolute bottom-6 right-6 z-40"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={toggleForm}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
          >
            {isFormOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Plus className="h-6 w-6" />
            )}
          </Button>
        </motion.div>

        {/* Report form sheet - appears as overlay */}
        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <SheetContent
            side="left"
            className="sm:max-w-md w-[90%] md:w-[450px] p-0 border-r shadow-xl"
          >
            <ReportForm
              onReportAdded={handleReportAdded}
              onCancel={() => setIsFormOpen(false)}
              selectedReport={selectedReport}
            />
          </SheetContent>
        </Sheet>

        {/* Reports sidebar sheet - appears as overlay */}
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent
            side="right"
            className="sm:max-w-md w-[90%] md:w-[450px] p-0 border-l shadow-xl"
          >
            <ReportsList
              reports={reports}
              onClose={() => setIsSidebarOpen(false)}
              onReportSelect={handleReportSelect}
            />
          </SheetContent>
        </Sheet>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading crisis reports...</p>
            </div>
          </div>
        )}
      </div>

      {/*Footer */}
      <footer className="border-t py-4 bg-card">
        <div className="container mx-auto px-4">
          {/*accreditation section */}
          <div className="mt-4 pt-4 border-t border-border/50 text-center">
            <div className="text-sm font-medium">
              &copy; {new Date().getFullYear()} PulsePoint Crisis Reporting
              System
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Map data &copy;{" "}
              <a
                href="https://www.openstreetmap.org/copyright"
                className="underline hover:text-foreground"
              >
                OpenStreetMap
              </a>{" "}
              contributors
            </div>
          </div>
        </div>
      </footer>

      <Toaster position="top-right" />
    </div>
  );
}

export default App;
