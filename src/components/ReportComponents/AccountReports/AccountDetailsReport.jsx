import React, { useState, useEffect, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import useStore from "../../../store/useStore";
import { format } from "date-fns";
import { renderToString } from "react-dom/server";
import GenericListReport from "../GenericList/GenericListReport";
import { PrintIcon } from "../../../utils/Icons";
import Pagination from "../../../hooks/usePagination";

// Helper function to get and format transaction values
const getTransactionValue = (transaction, key) => {
  if (key === "date") {
    return format(
      new Date(
        transaction.paymentDate || transaction.saleDate || transaction.date
      ),
      "dd-MMM-yyyy"
    );
  }
  if (key === "refId") {
    return (
      transaction.referenceNumber ||
      transaction.invoiceNumber ||
      transaction.receiptId ||
      "N/A"
    );
  }
  if (["amount", "totalAmount", "paidAmount", "discount"].includes(key)) {
    return (transaction[key] || 0).toFixed(2);
  }
  if (key === "type") {
    return transaction.paymentMethod || "Sale";
  }
  return transaction[key] || "N/A";
};

// Printable Component for the detailed report
const PrintableDetailedReport = ({
  reportType,
  person,
  transactions,
  startDate,
  endDate,
  detailsColumns,
  total,
  businessDetails,
}) => (
  <div className="p-2">
    <div className="text-center mb-4">
      <h1 className="text-2xl font-bold">
        {businessDetails?.name || "SnapMart"}
      </h1>
      <p className="text-sm">
        {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Account
      </p>
      <h2 className="text-lg font-semibold">{person.name}</h2>
      <p className="text-xs">
        Transactions from {format(new Date(startDate), "dd-MMM-yyyy")} to{" "}
        {format(new Date(endDate), "dd-MMM-yyyy")}
      </p>
    </div>
    <div className="text-xs mb-4">
      <p>
        <strong>Contact:</strong> {person.phone || "N/A"}
      </p>
      <p>
        <strong>Address:</strong> {person.address || "N/A"}
      </p>
    </div>
    <table className="w-full text-xs border-collapse">
      <thead className="border-t border-b border-black">
        <tr>
          {detailsColumns.map((col) => (
            <th key={col.key} className="p-1 text-left">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {transactions.map((t, index) => (
          <tr key={t._id || index}>
            {detailsColumns.map((col) => (
              <td key={col.key} className="p-1 capitalize">
                {col.key === "srNo"
                  ? index + 1
                  : getTransactionValue(t, col.key)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      <tfoot className="border-t-2 border-black font-bold">
        <tr>
          <td colSpan={detailsColumns.length - 1} className="p-1 text-right">
            Grand Total:
          </td>
          <td className="p-1 text-left">{total.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
  </div>
);

const AccountDetailsReport = ({
  reportType,
  title,
  fetchListApi,
  fetchDetailsApi,
  listColumns,
  detailsColumns,
}) => {
  const {
    setLoading,
    businessDetails,
    currentPage,
    setCurrentPage,
    rowsPerPage,
  } = useStore();
  const [peopleList, setPeopleList] = useState([]);
  const [selectedPersonId, setSelectedPersonId] = useState("all");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [transactionData, setTransactionData] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const fetchPeople = async () => {
      setLoading(true);
      try {
        const response = await fetchListApi();
        setPeopleList(response || []);
      } catch (error) {
        toast.error(`Failed to fetch ${reportType} list.`);
      } finally {
        setLoading(false);
      }
    };
    fetchPeople();
  }, [fetchListApi, reportType, setLoading]);

  useEffect(() => {
    if (selectedPersonId === "all" || !selectedPersonId) {
      setTransactionData(null);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setCurrentPage(1);
      try {
        const response = await fetchDetailsApi(selectedPersonId, {
          startDate,
          endDate,
        });
        setTransactionData(response);
      } catch (error) {
        toast.error(`Failed to fetch transaction details.`);
        console.error("Error fetching transaction details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [selectedPersonId, startDate, endDate, fetchDetailsApi, setLoading, setCurrentPage]);

  const transactionTotal = useMemo(() => {
    if (!transactionData) return 0;
    const amountKey = detailsColumns.find((c) =>
      ["amount", "totalAmount"].includes(c.key)
    )?.key;
    if (!amountKey) return 0;
    return transactionData.reduce(
      (sum, transaction) => sum + (transaction[amountKey] || 0),
      0
    );
  }, [transactionData, detailsColumns]);

  const handlePrint = () => {
    if (!iframeRef.current) return;
    const person = peopleList.find((p) => p._id === selectedPersonId);
    if (!person || !transactionData) {
      toast.error("No data available to print.");
      return;
    }

    const reportHtml = renderToString(
      <PrintableDetailedReport
        reportType={reportType}
        businessDetails={businessDetails}
        person={person}
        transactions={transactionData}
        startDate={startDate}
        endDate={endDate}
        detailsColumns={detailsColumns}
        total={transactionTotal}
      />
    );

    const printWindow = iframeRef.current.contentWindow;
    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>${person.name} - Account Details</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @page { size: A4; margin: 0.5in; }
        body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; }
      </style>
      </head><body>${reportHtml}</body></html>
    `);
    printWindow.document.close();
    iframeRef.current.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  const renderDetailedView = () => {
    if (transactionData === null) {
      return (
        <div className="text-center max-sm:text-sm p-8 text-gray-500">
          Loading details...
        </div>
      );
    }

    const person = peopleList.find((p) => p._id === selectedPersonId);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentData = transactionData.slice(indexOfFirstRow, indexOfLastRow);

    return (
      <div className="p-4 border rounded-lg mt-6">
        {person && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl max-sm:text-lg font-bold text-blue-900/90">
                Account Details for: {person.name}
              </h3>
              {transactionData.length > 0 && (
                <button
                  onClick={handlePrint}
                  className="flex cursor-pointer items-center gap-1 sm:gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-3 sm:px-4 rounded-md"
                >
                  <PrintIcon /> Print
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm max-sm:text-xs">
              <div>
                <strong>Contact:</strong> {person.phone || "N/A"}
              </div>
              <div>
                <strong>CNIC:</strong> {person.cnic || "N/A"}
              </div>
              <div>
                <strong>Address:</strong> {person.address || "N/A"}
              </div>
            </div>
          </>
        )}

        <h4 className="font-semibold mt-6 max-sm:text-sm mb-2">
          Transactions from {format(new Date(startDate), "dd-MMM-yyyy")} to{" "}
          {format(new Date(endDate), "dd-MMM-yyyy")}
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-sm max-sm:text-xs">
            <thead className="bg-blue-50">
              <tr>
                {detailsColumns.map((col) => (
                  <th key={col.key} className="p-2 text-left">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactionData.length > 0 ? (
                currentData.map((t, index) => (
                  <tr key={t._id || index} className="border-b">
                    {/* ✅ CORRECTED: Dynamically render all columns from props */}
                    {detailsColumns.map((col) => (
                      <td key={col.key} className="p-2 capitalize">
                        {/* Handle serial number based on the key from props */}
                        {col.key === "srNo"
                          ? indexOfFirstRow + index + 1
                          : getTransactionValue(t, col.key)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={detailsColumns.length}
                    className="text-center p-4 text-gray-500"
                  >
                    No transactions found for this period.
                  </td>
                </tr>
              )}
            </tbody>
            {transactionData.length > 0 && (
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td
                    colSpan={detailsColumns.length - 1}
                    className="p-2 text-right"
                  >
                    Grand Total:
                  </td>
                  <td className="p-2 text-left">
                    {transactionTotal.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
          <Pagination data={transactionData} />
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
        <select
          value={selectedPersonId}
          onChange={(e) => setSelectedPersonId(e.target.value)}
          className="w-full p-2 border max-sm:text-sm cursor-pointer border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80"
        >
          <option value="all">All {title}</option>
          {peopleList.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={`w-full max-sm:text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 disabled:bg-gray-200 disabled:cursor-not-allowed`}
          disabled={selectedPersonId === "all"}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={`w-full max-sm:text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 disabled:bg-gray-200 disabled:cursor-not-allowed`}
          disabled={selectedPersonId === "all"}
        />
      </div>

      {selectedPersonId !== "all" ? (
        renderDetailedView()
      ) : (
        <div className="mt-6">
          <GenericListReport
            title={title}
            fetchApi={fetchListApi}
            columns={listColumns}
          />
        </div>
      )}
      <iframe
        ref={iframeRef}
        style={{ display: "none" }}
        title="Print Frame"
      />
    </div>
  );
};

export default AccountDetailsReport;