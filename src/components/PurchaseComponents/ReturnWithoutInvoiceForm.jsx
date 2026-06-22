// components/PurchaseComponents/ReturnWithoutInvoiceForm.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import useStore from "../../store/useStore";
import toast from "react-hot-toast";
import ProductApis from "../../services/ProductApis";
import PeopleApis from "../../services/PeopleApis";
import ProductSearchForPurchase from "./ProductSearchForPurchase";
import { uid } from "uid";
import PurchaseApis from "../../services/PurchaseApis";
import PurchaseReturnFormCommon from "./PurchaseReturnFormCommon"; // Use the common RETURN component

const ReturnWithoutInvoiceForm = () => {
  const {
    setLoading,
    setError,
    products,
    setProducts,
    suppliers,
    setSuppliers,
  } = useStore();
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(
    `PRRW-${uid(10).toUpperCase()}`
  );

  useEffect(() => {
    const fetchSuppliersAndProducts = async () => {
      setLoading(true);
      try {
        const [fetchedSuppliers, allProducts] = await Promise.all([
          PeopleApis.searchSuppliers(""),
          ProductApis.searchProducts(""),
        ]);
        setSuppliers(fetchedSuppliers);
        setProducts(allProducts);
      } catch (err) {
        toast.error(`Failed to load data: ${err.message}`);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliersAndProducts();
  }, [setLoading, setError, setSuppliers, setProducts]);

  const onCartItemsInitialize = useCallback(() => {
    return [];
  }, []); // Empty dependency array, this callback is stable

  const validateQuantityWithoutInvoice = useCallback(
    (itemInCart, newQuantity) => {
      const actualProduct = products.find(
        (p) => p._id === itemInCart.productId
      );
      const currentStock = actualProduct ? actualProduct.stock : 0;
      if (itemInCart.instock === undefined || itemInCart.instock === null) {
        itemInCart.instock = currentStock;
      }
      if (newQuantity > currentStock) {
        return {
          error: `Cannot return more than current stock (${currentStock}) for ${itemInCart.productName}`,
          correctedItem: {
            ...itemInCart,
            quantity: currentStock,
            instock: currentStock,
            total: currentStock * itemInCart.purchasePriceAtReturn,
          },
        };
      }
      if (newQuantity < 0) {
        return {
          error: "Returned quantity cannot be negative.",
          correctedItem: {
            ...itemInCart,
            quantity: 0,
            total: 0,
          },
        };
      }
      return { error: null };
    },
    [products]
  );

  const resetFormSpecifics = useCallback(() => {
    setSelectedSupplier(suppliers.length > 0 ? suppliers[0]._id : "");
  }, [suppliers]);

  const selectedSupplierDetails = useMemo(() => {
    return suppliers.find((s) => s._id === selectedSupplier);
  }, [selectedSupplier, suppliers]);

  const modalDetails = useMemo(
    () => ({
      returnInvoiceNumber: {
        label: "Return Invoice #",
        value: invoiceNumber,
      },
      originalPurchase: { label: "Original Purchase #", value: "N/A" }, // No original purchase for this form
      supplier: {
        label: "Supplier",
        value: `${selectedSupplierDetails?.name || "N/A"} ${
          selectedSupplierDetails?.company
            ? `(${selectedSupplierDetails.company})`
            : ""
        }`,
      },
      returnDate: {
        label: "Return Date",
        value: new Date().toLocaleDateString(),
      },
    }),
    [selectedSupplierDetails]
  );

  const modalItemsColumns = useMemo(
    () => [
      { key: "productName", label: "Product" },
      { key: "productCode", label: "Code" },
      { key: "quantity", label: "Returned Qty" },
      {
        key: "purchasePriceAtReturn",
        label: "Price",
        render: (item) => `${item.purchasePriceAtReturn.toFixed(2)}`,
      },
      {
        key: "total",
        label: "Total",
        render: (item) => `${item.total.toFixed(2)}`,
        align: "right",
      },
    ],
    []
  );

  return (
    <PurchaseReturnFormCommon
      titlePrefix="Purchase Return (No Original Invoice)"
      initialInvoiceNumber={invoiceNumber}
      onInvoiceReset={() => {
        setInvoiceNumber(`PRRW-${uid(10).toUpperCase()}`);
      }}
      onCartItemsInitialize={onCartItemsInitialize} // Pass the memoized empty cart initializer
      validateQuantity={validateQuantityWithoutInvoice}
      createReturnApi={PurchaseApis.createPurchaseReturn}
      detailsComponent={
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
          <h3 className="text-xl max-sm:text-lg font-semibold text-gray-800 mb-4">
            Return Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="supplierSelect"
                className="block max-sm:text-sm font-medium text-gray-700 mb-1"
              >
                Select Supplier:
              </label>
              <select
                id="supplierSelect"
                value={selectedSupplier}
                onChange={(e) => {
                  setSelectedSupplier(e.target.value);
                }}
                className="w-full max-sm:text-sm cursor-pointer p-2 border border-gray-300 bg-gray-100 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none appearance-none"
              >
                <option value="">Select a Supplier</option>
                {suppliers &&
                  suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name}{" "}
                      {supplier.company && `(${supplier.company})`}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="returnDate"
                className="block max-sm:text-sm font-medium text-gray-700 mb-1"
              >
                Return Date:
              </label>
              <input
                id="returnDate"
                type="date"
                value={new Date().toISOString().split("T")[0]}
                readOnly
                className="w-full max-sm:text-sm p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
              />
            </div>
          </div>
        </div>
      }
      searchComponent={<ProductSearchForPurchase products={products} />}
      modalTitle="Purchase Return (Without Original Invoice)"
      modalDetails={modalDetails}
      modalItemsColumns={modalItemsColumns}
      resetFormSpecifics={resetFormSpecifics}
      supplierId={selectedSupplier}
      supplier_purchase_details={
        selectedSupplier
          ? {
              supplier: selectedSupplierDetails,
              purchase: null,
            }
          : {}
      }
    />
  );
};

export default ReturnWithoutInvoiceForm;
