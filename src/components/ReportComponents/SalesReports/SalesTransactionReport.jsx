import {
  useState,
  useEffect,
  useMemo,
  useRef
} from "react";
import toast from "react-hot-toast";
import { renderToString } from "react-dom/server";
import PeopleApis from "../../../services/PeopleApis";
import CustomerApis from "../../../services/CustomerApis";
import useStore from "../../../store/useStore";
import { PrintIcon } from "../../../utils/Icons";
import Pagination from "../../../hooks/usePagination";

const PrintableReport = ({
  data,
  totals,
  startDate,
  endDate,
  customerName,
  businessDetails,
}) => (
  <div>
    <div className="text-center mb-6">
      <h1 className="text-3xl font-extrabold text-blue-900/80 mb-2">
        {businessDetails?.name || "SnapMart"}
      </h1>
      <h2 className="text-xl font-bold text-gray-700">
        Sales Transaction Report
      </h2>
      <p className="text-sm text-gray-600">
        Date Range: {new Date(startDate).toLocaleDateString()} -{" "}
        {new Date(endDate).toLocaleDateString()}
      </p>
      <p className="text-sm text-gray-600">
        Customer: {customerName || "All Customers"}
      </p>
    </div>
    <table className="min-w-full text-sm">
      <thead className="bg-gray-100">
        <tr className="border-b border-gray-300">
          <th className="py-2 px-3 text-left font-semibold">S.No.</th>
          <th className="py-2 px-3 text-left font-semibold">Date</th>
          <th className="py-2 px-3 text-left font-semibold">Receipt #</th>
          <th className="py-2 px-3 text-left font-semibold">Customer</th>
          <th className="py-2 px-3 text-right font-semibold">Total Amount</th>
          <th className="py-2 px-3 text-right font-semibold">Paid Amount</th>
          <th className="py-2 px-3 text-right font-semibold">Discount</th>
        </tr>
      </thead>
      <tbody>
        {data &&
          data.map((sale, index) => (
            <tr key={sale.invoiceNumber} className="border-b border-gray-200">
              <td className="py-2 px-3">{index + 1}</td>
              <td className="py-2 px-3">{sale.saleDate.split("T")[0]}</td>
              <td className="py-2 px-3">{sale.invoiceNumber || "N/A"}</td>
              <td className="py-2 px-3">
                {sale.customerName || "Walk-in Customer"}
              </td>
              <td className="py-2 px-3 text-right">{sale.totalAmount || 0}</td>
              <td className="py-2 px-3 text-right">{sale.paidAmount || 0}</td>
              <td className="py-2 px-3 text-right">{sale.discount || 0}</td>
            </tr>
          ))}
      </tbody>
      <tfoot className="bg-gray-100 font-bold">
        <tr className="border-t-2 border-gray-300">
          <td colSpan="4" className="py-2 px-3 text-right">
            Grand Totals:
          </td>
          <td className="py-2 px-3 text-right">{totals.totalAmount || 0}</td>
          <td className="py-2 px-3 text-right">{totals.paidAmount || 0}</td>
          <td className="py-2 px-3 text-right">{totals.discount || 0}</td>
        </tr>
      </tfoot>
    </table>
    <div className="text-center text-gray-500 text-xs mt-8">
      Report generated on {new Date().toLocaleString()}
    </div>
  </div>
);

const SalesTransactionReport = () => {
  const {
    setLoading,
    customers,
    setCustomers,
    businessDetails,
    currentPage,
    setCurrentPage,
    rowsPerPage,
  } = useStore();
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [salesData, setSalesData] = useState([]);
  const [reportGenerated, setReportGenerated] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await PeopleApis.searchCustomers("");
        setCustomers(response);
      } catch (error) {
        toast.error("Failed to fetch customers.");
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };
    if (!customers || customers.length === 0) {
      fetchCustomers();
    }
  }, [setLoading, setCustomers, customers]);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both a start and end date.");
      return;
    }
    setLoading(true);
    setReportGenerated(false);
    setCurrentPage(1);
    try {
      const response = await CustomerApis.getSalesTransactionReport({
        customerId: selectedCustomer ? selectedCustomer : "all",
        startDate,
        endDate,
      });
      setSalesData(response || []);
      setReportGenerated(true);
      if (!response || response.length === 0) {
        toast.success("No data found for this period.");
      }
    } catch (error) {
      toast.error("Failed to generate report.");
      console.error("Error generating report:", error);
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };

  const reportTotals = useMemo(() => {
    return salesData.reduce(
      (acc, sale) => {
        acc.totalAmount += sale.totalAmount || 0;
        acc.paidAmount += sale.paidAmount || 0;
        acc.discount += sale.discount || 0;
        return acc;
      },
      { totalAmount: 0, paidAmount: 0, discount: 0 }
    );
  }, [salesData]);

  const handlePrint = () => {
    if (!iframeRef.current) {
      toast.error("Printing is not available right now. Please try again.");
      return;
    }

    const selectedCustomerName = selectedCustomer
      ? customers.find((c) => c._id === selectedCustomer)?.name
      : "All Customers";

    const reportHtml = renderToString(
      <PrintableReport
        data={salesData} // Pass the full data to print
        totals={reportTotals}
        startDate={startDate}
        endDate={endDate}
        customerName={selectedCustomerName}
        businessDetails={businessDetails}
      />
    );

    const printWindow = iframeRef.current.contentWindow;
    printWindow.document.open();
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Sales Transaction Report</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @page {
                    size: A4;
                    margin: 1in;
                }
                body {
                    font-family: 'Inter', sans-serif;
                }
                @media print {
               tfoot {
                  display: table-row-group; /* Prevent repeating footer on every printed page */
                  }
                  }
            </style>
        </head>
        <body>
            ${reportHtml}
        </body>
        </html>
    `);
    printWindow.document.close();

    iframeRef.current.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  const isGenerateDisabled = !startDate || !endDate;

  // --- Calculate current rows for the page ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentSales = salesData.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl max-sm:text-lg font-bold text-blue-900/90">
          Sales Transaction Report
        </h2>
        {reportGenerated && salesData.length > 0 && (
          <button
            onClick={handlePrint}
            className="flex items-center cursor-pointer gap-1 sm:gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-3 sm:px-4 rounded-md transition duration-300"
          >
            <PrintIcon />
            Print
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border border-gray-200 rounded-lg">
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          className="w-full max-sm:text-sm p-2 border cursor-pointer border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80"
        >
          <option value="">All Customers</option>
          {customers &&
            customers.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.name}
              </option>
            ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-2 max-sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full p-2 max-sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80"
        />
        <button
          onClick={handleGenerateReport}
          disabled={isGenerateDisabled}
          className="bg-blue-900/80 max-sm:text-sm cursor-pointer text-white font-bold py-2 px-4 rounded-md hover:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Generate
        </button>
      </div>

      {/* Report Display Area */}
      {reportGenerated ? (
        salesData.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">
                      S.No.
                    </th>
                    <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">
                      Receipt #
                    </th>
                    <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">
                      Customer
                    </th>
                    <th className="py-2 px-4 text-right text-sm font-semibold text-gray-700">
                      Total Amount
                    </th>
                    <th className="py-2 px-4 text-right text-sm font-semibold text-gray-700">
                      Paid Amount
                    </th>
                    <th className="py-2 px-4 text-right text-sm font-semibold text-gray-700">
                      Discount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentSales.map((sale, index) => (
                    <tr
                      key={sale.invoiceNumber}
                      className="hover:bg-gray-50 max-sm:text-xs text-sm"
                    >
                      <td className="py-2 px-4 border-b text-gray-800">
                        {indexOfFirstRow + index + 1}
                      </td>
                      <td className="py-2 px-4 border-b text-gray-800">
                        {sale.saleDate.split("T")[0]}
                      </td>
                      <td className="py-2 px-4 border-b text-gray-800">
                        {sale.invoiceNumber || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b text-gray-800">
                        {sale.customerName || "Walk-in Customer"}
                      </td>
                      <td className="py-2 px-4 border-b text-right text-gray-800">
                        {sale.totalAmount || 0}
                      </td>
                      <td className="py-2 px-4 border-b text-right text-gray-800">
                        {sale.paidAmount || 0}
                      </td>
                      <td className="py-2 px-4 border-b text-right text-gray-800">
                        {sale.discount || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-bold">
                  <tr className="max-sm:text-xs text-sm">
                    <td
                      colSpan="4"
                      className="py-2 px-4 border-b text-right text-gray-800"
                    >
                      Grand Totals:
                    </td>
                    <td className="py-2 px-4 border-b text-right text-gray-800">
                      {reportTotals.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b text-right text-gray-800">
                      {reportTotals.paidAmount.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b text-right text-gray-800">
                      {reportTotals.discount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <Pagination data={salesData} />
          </>
        ) : (
          <div className="text-center py-10 max-sm:text-sm text-gray-500">
            <p>No sales records found for the selected criteria.</p>
          </div>
        )
      ) : (
        <div className="text-center py-10 max-sm:text-sm text-gray-400">
          <p>
            Please select your filters and click "Generate" to see the report.
          </p>
        </div>
      )}
      <iframe ref={iframeRef} style={{ display: "none" }} title="Print Frame" />
    </div>
  );
};

export default SalesTransactionReport;
