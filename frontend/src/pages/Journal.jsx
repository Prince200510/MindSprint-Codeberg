import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChefHat,
  Edit3,
  Heart,
  Pill,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "../components/Card.jsx";
import { Layout } from "../components/Layout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const nav = [
  { to: "/dashboard/user", label: "Overview", icon: User },
  { to: "/dashboard/user/journal", label: "Health Journal", icon: Edit3 },
  {
    to: "/dashboard/user/doctors",
    label: "Available Doctors",
    icon: Stethoscope,
  },
  {
    to: "/dashboard/user/appointments",
    label: "My Appointments",
    icon: Calendar,
  },
  { to: "/dashboard/user/prescriptions", label: "Prescriptions", icon: Heart },
  { to: "/dashboard/user/medicines", label: "Medicines", icon: Pill },
  { to: "/dashboard/user/diet", label: "AI Diet Plan", icon: ChefHat },
  { to: "/dashboard/user/community", label: "Community", icon: Users },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

export const Journal = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [text, setText] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const [journals, setJournals] = useState([]);
  const [analyses, setAnalyses] = useState([]);

  const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    options.signal = controller.signal;

    try {
      const response = await fetch(url, options);
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };

  // Add a new journal entry
  const addJournal = async (data) => {
    if (!data || !data.userId || !data.text || !data.text.trim()) {
      throw new Error("Invalid journal data: userId and text are required.");
    }

    try {
      const response = await fetchWithTimeout(`${API_BASE}/journals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to add journal.");
      }

      return await response.json();
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      throw new Error(
        error.message || "An unexpected error occurred while adding journal."
      );
    }
  };

  // Get all journals for a user
  const getJournals = async (userId) => {
    if (!userId) {
      throw new Error("User ID is required to fetch journals.");
    }

    try {
      const response = await fetchWithTimeout(
        `${API_BASE}/journals/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch journals.");
      }

      return await response.json();
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request timed out. Please check your connection.");
      }
      throw new Error(
        error.message || "An unexpected error occurred while fetching journals."
      );
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await addJournal({
        userId: user.id,
        text,
      });

      console.log("Journal added:", res); // Debugging line

      setText("");

      // Fixed destructuring here – fetch API returns parsed JSON directly
      const { journal, analysis, supportMessage } = res;

      setJournals((prev) => [journal, ...prev]);
      setAnalyses((prev) => [analysis, ...prev]);

      if (supportMessage) {
        setSupportMessage(supportMessage);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 6000);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving journal");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getJournals(user.id);
        setJournals(res.journals || []);
        setAnalyses(res.analysis || []);
      } catch (error) {
        console.error("Error fetching journals:", error);
        addNotification("Error fetching journals", "error");
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user]);

  return (
    <Layout items={nav}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
              <Edit3 className="w-8 h-8 mr-3 text-primary" />
              Health Journal
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Keep track of your health and emotions by writing daily entries
            </p>
          </div>
        </motion.div>

        {/* Journal Form */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <form onSubmit={handleFormSubmit}>
              <textarea
                placeholder="Write your journal entry..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <button
                type="submit"
                className="mt-3 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition"
              >
                Save Entry
              </button>
            </form>
          </Card>
        </motion.div>

        {/* Support Popup */}
        <AnimatePresence>
          {showPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40"
            >
              <div className="relative bg-white p-6 rounded-2xl shadow-xl max-w-md w-full animate-fadeIn">
                <p className="text-blue-600 font-semibold text-lg mb-2">
                  💬 Support
                </p>
                <p className="text-gray-700">{supportMessage}</p>
                <button
                  onClick={() => setShowPopup(false)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 font-bold text-xl"
                >
                  ✖
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Journal List */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center space-x-3 border-b border-gray-700 pb-4">
              <Edit3 className="w-6 h-6 text-blue-400" />
              <span>Your Past Journals</span>
            </h2>

            {journals.length === 0 ? (
              <p className="text-gray-500 text-center py-10 italic">
                No entries yet. Start sharing your thoughts!
              </p>
            ) : (
              <div className="space-y-6">
                {journals.map((j) => {
                  const analysis = analyses.find((a) => a.journalId === j._id);
                  const sentimentColor =
                    analysis?.sentiment === "positive"
                      ? "text-green-400"
                      : analysis?.sentiment === "negative"
                      ? "text-red-400"
                      : "text-yellow-400";
                  const sentimentIcon =
                    analysis?.sentiment === "positive"
                      ? "😊"
                      : analysis?.sentiment === "negative"
                      ? "😔"
                      : "😐";

                  const sentimentBorder =
                    analysis?.sentiment === "positive"
                      ? "border-green-500"
                      : analysis?.sentiment === "negative"
                      ? "border-red-500"
                      : "border-yellow-500";

                  return (
                    <div
                      key={j._id}
                      className={`bg-gray-800 p-5 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border ${sentimentBorder}`}
                    >
                      <div className="flex flex-col md:flex-row md:justify-between mb-4">
                        <p className="text-gray-200 mb-2 text-md break-words text-2xl">
                          {j.text}
                        </p>

                        <span className="text-md text-gray-400 mb-3">
                          <strong>Date:</strong>{" "}
                          {new Date(
                            j.timestamp || j.createdAt
                          ).toLocaleString()}
                        </span>
                      </div>

                      {analysis && (
                        <div className="space-y-2 flex gap-x-3 text-md text-gray-300">
                          <div
                            className={`text-lg font-semibold ${sentimentColor} flex items-center md:mt-0`}
                          >
                            <span className="mr-2">Sentiment:</span>
                            <span>
                              {analysis.sentiment} {sentimentIcon}
                            </span>
                          </div>
                          {analysis.emotions?.length > 0 && (
                            <p>
                              <strong className="text-gray-400">
                                Emotions:
                              </strong>{" "}
                              {analysis.emotions.join(", ")}
                            </p>
                          )}
                          {analysis.triggers?.length > 0 && (
                            <p>
                              <strong className="text-gray-400">
                                Triggers:
                              </strong>{" "}
                              {analysis.triggers.map((t) => t.name).join(", ")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Layout>
  );
};
