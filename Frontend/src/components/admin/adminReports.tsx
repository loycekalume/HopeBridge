import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import AdminSidebar from "../../components/admin/sidebar";
import { apiCall } from "../../utils/api";
import "../../styles/admin.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const AdminReports: React.FC = () => {
  const [reportStats, setReportStats] = useState({
    totalReports: 0,
    pending: 0,
    reviewed: 0,
    resolved: 0,
  });
  const [reportsByCategory, setReportsByCategory] = useState<any[]>([]);
  const [reportsTrend, setReportsTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    reported_user_id: "",
    category: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchReportStats = async () => {
    try {
      const res = await apiCall("/api/reports/stats", "GET");
      setReportStats(res.summary);
      setReportsByCategory(res.byCategory);
      setReportsTrend(res.trend);
    } catch (error) {
      console.error("Error fetching reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportStats();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReportForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitReport = async () => {
    if (!reportForm.reported_user_id || !reportForm.category || !reportForm.description) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await apiCall("/api/reports", "POST", reportForm);
      alert("Report submitted successfully.");
      setShowModal(false);
      setReportForm({ reported_user_id: "", category: "", description: "" });
      fetchReportStats(); // refresh charts
    } catch (err) {
      console.error("Error submitting report:", err);
      alert("Error submitting report.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading report data...</div>;

  const { totalReports, pending, reviewed, resolved } = reportStats;

  return (
    <div className="admin-reports">
      <AdminSidebar />
      <main className="admin-reports-main">
        <div className="reports-header">
          <h1 className="reports-title">Reports Dashboard</h1>
          <button className="btn-create" onClick={() => setShowModal(true)}>
            ✍️ Write Report
          </button>
        </div>

        {/* Summary cards */}
        <div className="report-summary-cards">
          <div className="summary-card total">
            <h3>Total Reports</h3>
            <p>{totalReports}</p>
          </div>
          <div className="summary-card pending">
            <h3>Pending</h3>
            <p>{pending}</p>
          </div>
          <div className="summary-card reviewed">
            <h3>Reviewed</h3>
            <p>{reviewed}</p>
          </div>
          <div className="summary-card resolved">
            <h3>Resolved</h3>
            <p>{resolved}</p>
          </div>
        </div>

        {/* Charts section */}
        <div className="charts-container">
          {/* Pie chart - by category */}
          <div className="chart-box">
            <h3>Reports by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportsByCategory}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {reportsByCategory.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Line chart - trend */}
          <div className="chart-box">
            <h3>Reports Trend (Last 6 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="reports"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar chart - comparison */}
        <div className="chart-box">
          <h3>Report Status Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { status: "Pending", count: pending },
                { status: "Reviewed", count: reviewed },
                { status: "Resolved", count: resolved },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>

      {/* Modal for writing a report */}
      {showModal && (
        <div className="modal-overlay4">
          <div className="modal4">
            <h2>Write a Report</h2>

            <label>
              Reported User ID
              <input
                type="number"
                name="reported_user_id"
                value={reportForm.reported_user_id}
                onChange={handleInputChange}
                placeholder="Enter User ID"
              />
            </label>

            <label>
              Category
              <select
                name="category"
                value={reportForm.category}
                onChange={handleInputChange}
              >
                <option value="">-- Select Category --</option>
                <option value="Fraud">Fraud</option>
                <option value="Abuse">Abuse</option>
                <option value="Spam">Spam</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={reportForm.description}
                onChange={handleInputChange}
                placeholder="Describe the issue..."
              />
            </label>

            <div className="modal-actions4">
              <button
                className="btn-save"
                onClick={handleSubmitReport}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
              <button
                className="btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
