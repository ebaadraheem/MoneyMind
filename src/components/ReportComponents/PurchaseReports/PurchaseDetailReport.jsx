import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { renderToString } from "react-dom/server";
import PeopleApis from "../../../services/PeopleApis";
import SupplierApis from "../../../services/SupplierApis";
import ProductApis from "../../../services/ProductApis";
import useStore from "../../../store/useStore";
import { format } from "date-fns";
import { PrintIcon } from "../../../utils/Icons";
import Pagination from "../../../hooks/usePagination";

const PrintableDetailedReport = ({
  data,
  startDate,
  endDate,
  supplierName,
  productName,
  businessDetails
}) => (
  <div className="p-2">
    <div className="text-center mb-4">
      <h1 className="text-2xl font-bold">{businessDetails?.name || "SnapMart"}</h1>
      <h2 className="text-lg font-semibold">Purchase Details Report</h2>
      <p className="text-sm text-gray-600">
        Date Range: {new Date(startDate).toLocaleDateString()} -{" "}
        {new Date(endDate).toLocaleDateString()}
      </p>
      <p className="text-sm text-gray-600">
        Supplier: {supplierName || "All Suppliers"}
      </p>
      <p className="text-sm text-gray-600">
        Product: {productName || "All Products"}
      </p>
    </div>
    <table className="w-full text-xs border-collapse">
      {data.map((purchase) => (
        <React.Fragment key={purchase.invoiceNumber}>
          <tbody className="border border-gray-300">
            <tr className="bg-gray-100">
              <td className="p-1 font-bold" colSpan="2">
                Invoice #: {purchase.invoiceNumber}
              </td>
              <td className="p-1" colSpan="2">
                Supplier: {purchase.supplierName}
              </td>
              <td className="p-1 text-right" colSpan="2">
                Date: {format(new Date(purchase.purchaseDate), "dd-MMM-yyyy")}
              </td>
            </tr>
            <tr className="bg-gray-100 border-b border-gray-300">
              <td className="p-1" colSpan="2">
                Contact: {purchase.supplierContact || "N/A"}
              </td>
              <td className="p-1" colSpan="2">
                Address: {purchase.supplierAddress || "N/A"}
              </td>
              <td className="p-1 text-right font-bold" colSpan="2">
                Total: {purchase.totalAmount.toFixed(2)}
              </td>
            </tr>
            <tr className="bg-gray-200 font-semibold">
              <td className="p-1 text-left">S.No.</td>
              <td className="p-1 text-left">UOM</td>
              <td className="p-1 text-left">Product</td>
              <td className="p-1 text-right">Qty</td>
              <td className="p-1 text-right">Unit Price</td>
              <td className="p-1 text-right">Total Price</td>
            </tr>
            {purchase.products.map((product, index) => (
              <tr
                key={product._id}
                className="border-b border-gray-200 last:border-b-0"
              >
                <td className="p-1">{index + 1}</td>
                <td className="p-1">{product.uom || "N/A"}</td>
                <td className="p-1">{product.name}</td>
                <td className="p-1 text-right">{product.quantity}</td>
                <td className="p-1 text-right">
                  {product.purchasePrice.toFixed(2)}
                </td>
                <td className="p-1 text-right">
                  {(product.quantity * product.purchasePrice).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tr style={{ height: "10px" }}>
            <td colSpan="6"></td>
          </tr>
        </React.Fragment>
      ))}
    </table>
  </div>
);

const PurchaseDetailsReport = () => {
  const { setLoading, suppliers, setSuppliers, products, setProducts,businessDetails, currentPage, setCurrentPage, rowsPerPage } =
    useStore();
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [detailedPurchaseData, setDetailedPurchaseData] = useState([]);
  const [reportGenerated, setReportGenerated] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [suppliersRes, productsRes] = await Promise.all([
          PeopleApis.searchSuppliers(""),
          ProductApis.searchProducts(""),
        ]);
        setSuppliers(suppliersRes);
        setProducts(productsRes);
      } catch (error) {
        toast.error("Failed to fetch filters data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setLoading, setSuppliers, setProducts]);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both a start and end date.");
      return;
    }
    setLoading(true);
    setReportGenerated(false);
    setCurrentPage(1); // Reset to page 1 for new report
    try {
      const response = await SupplierApis.getPurchaseDetailsReport({
        supplierId: selectedSupplier || "all",
        productId: selectedProduct || "all",
        startDate,
        endDate,
      });
      setDetailedPurchaseData(response || []);
      setReportGenerated(true);
      if (!response || response.length === 0) {
        toast.success("No data found.");
      }
    } catch (error) {
      toast.error("Failed to generate report.");
      setDetailedPurchaseData([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!iframeRef.current) {
      toast.error("Printing not available.");
      return;
    }
    const reportHtml = renderToString(
      <PrintableDetailedReport
        data={detailedPurchaseData}
        startDate={startDate}
        endDate={endDate}
        supplierName={selectedSupplier}
        productName={selectedProduct}
        businessDetails={businessDetails}
      />
    );
    const printWindow = iframeRef.current.contentWindow;
    printWindow.document.open();
    printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Purchase Details Report</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @page { size: A4; margin: 0.5in; }
                    body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; }
                </style>
            </head>
            <body>${reportHtml}</body>
            </html>
        `);
    printWindow.document.close();
    iframeRef.current.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  // --- Calculate current rows for the page ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentSales = detailedPurchaseData.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl max-sm:text-lg font-bold text-blue-900/90">
          Purchase Detailed Report
        </h2>
        {reportGenerated && detailedPurchaseData.length > 0 && (
          <button
            onClick={handlePrint}
            className="flex items-center cursor-pointer gap-1 sm:gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-3 sm:px-4 rounded-md"
          >
            <PrintIcon /> Print
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 border border-gray-200 rounded-lg">
        <select
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          className="w-full p-2 border max-sm:text-sm cursor-pointer border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80"
        >
          <option value="">All Suppliers</option>
          {suppliers.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="w-full p-2 border max-sm:text-sm cursor-pointer border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80"
        >
          <option value="">All Products</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-2 border max-sm:text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full p-2 max-sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80"
        />
        <button
          onClick={handleGenerateReport}
          className="bg-blue-900/80  max-sm:text-sm cursor-pointer text-white font-bold py-2 px-4 rounded-md hover:bg-blue-900"
        >
          Generate
        </button>
      </div>

      {reportGenerated ? (
        detailedPurchaseData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm max-sm:text-xs">
              <thead>
                <tr className="text-left bg-blue-50">
                  <th className="p-2 font-semibold" colSpan={3}>
                    Invoice Details
                  </th>
                  <th className="p-2 font-semibold text-right" colSpan={3}>
                    
                  </th>
                </tr>
              </thead>
              {currentSales.map((purchase) => (
                <tbody
                  key={purchase.invoiceNumber}
                  className="border border-gray-300"
                >
                  <tr className="bg-gray-100 font-semibold">
                    <td className="p-2" colSpan={6}>
                      <div className="flex justify-between items-center">
                        <span>
                          Invoice #:{" "}
                          <span className="font-bold">
                            {purchase.invoiceNumber}
                          </span>
                          <span className="mx-4">|</span>
                          Supplier:{" "}
                          <span className="font-normal">
                            {purchase.supplierName}
                          </span>
                        </span>
                        <span>
                          Date:{" "}
                          <span className="font-normal">
                            {format(
                              new Date(purchase.purchaseDate),
                              "dd-MMM-yyyy"
                            )}
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs mt-1">
                        <span>
                          Contact:{" "}
                          <span className="font-normal">
                            {purchase.supplierContact || "N/A"}
                          </span>
                        </span>
                        <span className="font-bold">
                          Total: {purchase.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs mt-1">
                        Address:{" "}
                        <span className="font-normal">
                          {purchase.supplierAddress || "N/A"}
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr className="bg-blue-100 text-left font-semibold text-xs">
                    <td className="p-1 pl-2">S.No.</td>
                    <td className="p-1">Product</td>
                    <td className="p-1">UOM</td>
                    <td className="p-1 text-right">Qty</td>
                    <td className="p-1 text-right">Unit Price</td>
                    <td className="p-1 pr-2 text-right">Total Price</td>
                  </tr>
                  {purchase.products.map((product, index) => (
                    <tr
                      key={product._id}
                      className="border-b last:border-b-0 text-xs"
                    >
                      <td className="p-1 pl-2">{index + 1}</td>
                      <td className="p-1">{product.name}</td>
                      <td className="p-1">{product.uom || "N/A"}</td>
                      <td className="p-1 text-right">{product.quantity}</td>
                      <td className="p-1 text-right">
                        {product.purchasePrice.toFixed(2)}
                      </td>
                      <td className="p-1 pr-2 text-right">
                        {(product.quantity * product.purchasePrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
            <Pagination data={detailedPurchaseData} />
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No records found.</p>
          </div>
        )
      ) : (
        <div className="text-center py-10 text-gray-400">
          <p>Please select filters and click "Generate".</p>
        </div>
      )}
      <iframe ref={iframeRef} style={{ display: "none" }} title="Print Frame" />
    </div>
  );
};

export default PurchaseDetailsReport;
