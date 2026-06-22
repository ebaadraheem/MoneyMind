import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"; // Add useRef
import useStore from "../../store/useStore";
import toast from "react-hot-toast";
import ProductApis from "../../services/ProductApis";
import PurchaseApis from "../../services/PurchaseApis";
import PeopleApis from "../../services/PeopleApis";
import ProductSearchForPurchase from "./ProductSearchForPurchase";
import { uid } from "uid";
import CommonPurchaseForm from "./CommonPurchaseForm";

const PurchaseForm = () => {
  const setLoading = useStore(state => state.setLoading);
  const setError = useStore(state => state.setError);
  const products = useStore(state => state.products);
  const suppliers = useStore(state => state.suppliers);
  const setSuppliers = useStore(state => state.setSuppliers);
  const setProducts = useStore(state => state.setProducts);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [invoiceNumber, setInvoiceNumber] = useState(`PR-${uid(10).toUpperCase()}`);
  const [amountPaid, setAmountPaid] = useState("");
  const hasFetchedInitialData = useRef(false);
  useEffect(() => {
    if (hasFetchedInitialData.current || (products.length > 0 && suppliers.length > 0)) {
        return;
    }

    let isMounted = true;
    const fetchInitialData = async () => {
      setLoading(true); 
      try {
        const fetchedSuppliers = await PeopleApis.searchSuppliers("");
        const allProducts = await ProductApis.searchProducts("");

        if (isMounted) {
          setSuppliers(fetchedSuppliers);
          setProducts(allProducts);

          if (fetchedSuppliers.length > 0 && !selectedSupplier) {
            setSelectedSupplier(fetchedSuppliers[0]._id);
          }
          hasFetchedInitialData.current = true;
        }
      } catch (err) {
        if (isMounted) {
          toast.error(`Failed to load initial data: ${err.message}`);
          setError(`Failed to load initial data: ${err.message}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInitialData();
    setInvoiceNumber(`PR-${uid(10).toUpperCase()}`); 
    return () => {
      isMounted = false;
    };
  }, [setLoading, setError, setSuppliers, setProducts, products.length, suppliers.length, selectedSupplier]); 

  const handleCompletePurchase = useCallback(async (cartItems, totalCartAmount, paidAmountValueFromCommonForm) => { 
    if (!selectedSupplier) {
      toast.error("Please select a supplier.");
      throw new Error("No supplier selected.");
    }

    const purchaseData = {
      invoiceNumber,
      supplier: selectedSupplier,
      purchaseDate,
      items: cartItems.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
      })),
      totalAmount: parseFloat(totalCartAmount),
      paidAmount: paidAmountValueFromCommonForm === "" ? 0 : parseFloat(paidAmountValueFromCommonForm), 
    };

    await PurchaseApis.createPurchase(purchaseData);
  }, [invoiceNumber, selectedSupplier, purchaseDate]); 

  const resetFormSpecifics = useCallback(() => {
    setSelectedSupplier(suppliers.length > 0 ? suppliers[0]._id : "");
    setPurchaseDate(new Date().toISOString().split("T")[0]);
    setInvoiceNumber(`PR-${uid(10).toUpperCase()}`);
    setAmountPaid(""); 
  }, [suppliers]);

  const selectedSupplierDetails = useMemo(() => {
    return suppliers.find((s) => s._id === selectedSupplier);
  }, [selectedSupplier, suppliers]);

  const modalDetails = useMemo(() => ({
    invoiceNumber: { label: "Invoice Number", value: invoiceNumber },
    supplier: {
      label: "Supplier",
      value: `${selectedSupplierDetails?.name || "N/A"} ${selectedSupplierDetails?.company ? `(${selectedSupplierDetails.company})` : ""}`
    },
    purchaseDate: { label: "Purchase Date", value: new Date(purchaseDate).toLocaleDateString() },
  }), [invoiceNumber, selectedSupplierDetails, purchaseDate]);

  const modalItemsColumns = useMemo(() => ([
    { key: "productName", label: "Product" },
    { key: "quantity", label: "Qty" },
    { key: "purchasePrice", label: "Price", render: (item) => `${item.purchasePrice.toFixed(2)}` },
    { key: "total", label: "Total", render: (item) => `${item.total.toFixed(2)}`, align: 'right' },
  ]), []);

  return (
    <CommonPurchaseForm
      title="New Purchase"
      onCompletePurchase={handleCompletePurchase}
      resetFormState={resetFormSpecifics}
      productSearchComponent={<ProductSearchForPurchase products={products} />}
      detailsComponent={
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-xl max-sm:text-lg font-semibold text-gray-800 mb-4">
            Purchase Details
          </h3>
          <div className="mb-4">
            <label htmlFor="supplierSelect" className="block text-sm max-sm:text-xs font-medium text-gray-700 mb-1">
              Select Supplier:
            </label>
            <div className="relative">
              <select
                id="supplierSelect"
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full p-2 text-sm max-sm:text-xs pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none appearance-none"
              >
                <option value="">Select a Supplier</option>
                {suppliers &&
                  suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name} {supplier.company && `(${supplier.company})`}
                    </option>
                  ))}
              </select>
            </div>
            {selectedSupplier && (
              <p className="text-sm max-sm:text-xs text-gray-600 mt-2">
                Selected: {selectedSupplierDetails?.name} {selectedSupplierDetails?.company && `(${selectedSupplierDetails.company})`}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="purchaseDate" className="block text-sm max-sm:text-xs font-medium text-gray-700 mb-1">
              Purchase Date:
            </label>
            <div className="relative">
              <input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                disabled={true}
                className="w-full p-2 text-sm max-sm:text-xs pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
              />
            </div>
          </div>
        </div>
      }
      amountPaidInput={
        <div className="flex items-center gap-2 mr-2 max-sm:flex-col ">
          <label htmlFor="amountPaid" className="text-lg font-semibold text-gray-800">
            Amount Paid:
          </label>
          <input
            id="amountPaid"
            type="number"
            step="1"
            min="0" 
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            placeholder="0"
            className="w-40 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition-colors duration-200 outline-none text-right sm:text-lg"
          />
        </div>
      }
      modalTitle="Purchase Summary"
      modalDetails={modalDetails}
      modalItemsColumns={modalItemsColumns}
    />
  );
};

export default PurchaseForm;