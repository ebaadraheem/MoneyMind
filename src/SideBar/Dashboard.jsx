import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useEffect, useState, useCallback } from "react";
import useStore from "../store/useStore";
import api from "../services/api";
import { format } from "date-fns";
import {  getMonthName } from "../utils/helper";
import { IconDashboard } from "../utils/Icons";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const [dailySalesData, setDailySalesData] = useState([]);
  const [monthlySalesData, setMonthlySalesData] = useState([]);
  const [AllDetails, setAllDetails] = useState({});

  const { setLoading, setError, openModal } = useStore();
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dailySales = await api.getDailySalesSummary();
      const monthlySales = await api.getMonthlySalesSummary();
      const fetchAllDetails = await api.getAllDetails();
const formattedDailySales = dailySales
  .map((d) => ({
    date: format(new Date(d.date), "yyyy-MM-dd"), // or d._id if you're still using _id as date
    total: d.total,
    walkIn: d.walkIn,
    registered: d.registered,
  }))
  .sort((a, b) => new Date(a.date) - new Date(b.date));
      const formattedMonthlySales = monthlySales
        .map((m) => ({
          month: getMonthName(m.month - 1),
          sales: m.totalSales,
        }))
        .sort((a, b) => {
          const monthsOrder = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          return monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month);
        });

      setDailySalesData(formattedDailySales);
      setMonthlySalesData(formattedMonthlySales);
      setAllDetails(fetchAllDetails);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, openModal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return (
    <motion.div
      key="admin-dashboard"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold text-blue-900/90 mb-6 flex items-center">
        <IconDashboard className="w-8 h-8 mr-2" />
        Dashboard
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg gap-0.5 shadow-sm flex justify-center items-center">
          <div className=" w-[40%] flex justify-center items-center">
            <img src="/customer-blue.png" className=" w-12 h-12 max-sm:w-9 max-sm:h-9" alt="" />
          </div>
          <div className="flex justify-center items-start w-[60%] flex-col  ">
          <p className="text-gray-600 text-sm">Customers</p>
          <p className="text-3xl font-bold  text-blue-900/90 break-all">
            {AllDetails.totalCustomers || 0}
          </p>
          </div>
        </div>
        <div className="bg-gray-50 gap-0.5 p-4 rounded-lg shadow-sm flex justify-center items-center">
          <div className=" w-[40%] flex justify-center items-center">
            <img src="/supplier-blue.png" className=" w-13 h-13 max-sm:w-10 max-sm:h-10" alt="" />
          </div>
          <div className="flex justify-center items-start w-[60%] flex-col ">
          <p className="text-gray-600  text-sm">Suppliers</p>
          <p className="text-3xl font-bold  text-blue-900/90 break-all">
            {AllDetails.totalSuppliers || 0}
          </p>
          </div>
        </div>
        <div className="bg-gray-50 gap-0.5 p-4 rounded-lg shadow-sm flex justify-center items-center">
          <div className=" w-[40%] flex justify-center items-center">
            <img src="/employee-blue.png" className=" w-14 h-14 max-sm:w-10 max-sm:h-10" alt="" />
          </div>
          <div className="flex justify-center items-start w-[60%] flex-col ">
          <p className="text-gray-600  text-sm">Employees</p>
          <p className="text-3xl font-bold  text-blue-900/90  break-all">
            {AllDetails.totalEmployees || 0}
          </p>
          </div>
        </div>
        <div className="bg-gray-50 gap-0.5 p-4 rounded-lg shadow-sm flex justify-center items-center">
          <div className=" w-[40%] flex justify-center items-center">
            <img src="/stock-blue.png" className=" w-13 h-13 max-sm:w-10 max-sm:h-10" alt="" />
          </div>
          <div className="flex justify-center items-start w-[60%] flex-col ">
          <p className="text-gray-600  text-sm">Current Stock</p>
          <p className="text-3xl font-bold  text-blue-900/90 break-all">
            {AllDetails.totalStock || 0}
          </p>
          </div>
        </div>
        <div className="bg-gray-50 gap-0.5 p-4 rounded-lg shadow-sm flex justify-center items-center">
          <div className=" w-[40%] flex justify-center items-center">
            <img src="/product-management-blue.png" className=" w-13 h-13 max-sm:w-10 max-sm:h-10" alt="" />
          </div>
          <div className="flex justify-center items-start w-[60%] flex-col ">
          <p className="text-gray-600  text-sm">Products</p>
          <p className="text-3xl font-bold  text-blue-900/90 break-all">
            {AllDetails.totalProducts || 0}
          </p>
          </div>
        </div>
        <div className="bg-gray-50 gap-0.5 p-4 rounded-lg shadow-sm flex justify-center items-center">
          <div className=" w-[40%] flex justify-center items-center">
            <img src="/sales-blue.png" className=" w-13 h-13 max-sm:w-10 max-sm:h-10" alt="" />
          </div>
          <div className="flex justify-center items-start w-[60%] flex-col ">
          <p className="text-gray-600  text-sm">Sale Invoices</p>
          <p className="text-3xl font-bold  text-blue-900/90 break-all">
            {AllDetails.totalSalesInvoices || 0}
          </p>
          </div>
        </div>
        <div className="bg-gray-50 gap-0.5 p-4 rounded-lg shadow-sm flex justify-center items-center">
          <div className=" w-[40%] flex justify-center items-center">
            <img src="/cart-blue.png" className=" w-13 h-13 max-sm:w-10 max-sm:h-10" alt="" />
          </div>
          <div className="flex justify-center items-start w-[60%] flex-col ">
          <p className="text-gray-600  text-sm">Purchases</p>
          <p className="text-3xl font-bold  text-blue-900/90  break-all">
            {AllDetails.totalPurchases || 0}
          </p>
          </div>
        </div>
        <div className="bg-gray-50 gap-0.5 p-4 rounded-lg shadow-sm flex justify-center items-center">
          <div className=" w-[40%] flex justify-center items-center">
            <img src="/expense-blue.png" className=" w-13 h-13 max-sm:w-10 max-sm:h-10" alt="" />
          </div>
          <div className="flex justify-center items-start w-[60%] flex-col ">
          <p className="text-gray-600  text-sm">Expenses Amount</p>
          <p className="text-3xl font-bold  text-blue-900/90 break-all">
            {AllDetails.totalExpenses || 0}
          </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Daily Sales Trend (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={dailySalesData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => value} />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#007BFF"
                name="Total Sales"
              />
              <Line
                type="monotone"
                dataKey="walkIn"
                stroke="#FF9800"
                name="Walk-In Sales"
              />
              <Line
                type="monotone"
                dataKey="registered"
                stroke="#4CAF50"
                name="Registered Sales"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Monthly Sales Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={monthlySalesData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => value} />
              <Legend />
              <Bar dataKey="sales" fill="#28A745" name="Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
