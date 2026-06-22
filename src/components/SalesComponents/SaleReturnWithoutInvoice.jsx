import React, { useState, useEffect, useCallback, useMemo } from "react";
import useStore from "../../store/useStore";
import toast from "react-hot-toast";
import ProductApis from "../../services/ProductApis";
import PeopleApis from "../../services/PeopleApis";
import ProductSearchForSale from "./ProductSearchForSale";
import { uid } from "uid";
import SaleReturnFormCommon from "./SaleReturnFormCommon"; // Use the common RETURN component
import SaleApis from "../../services/SaleApis";

const SaleReturnWithoutInvoice = () => {
  const {
    setLoading,
    setError,
    products,
    setProducts,
    customers,
    setCustomers,
  } = useStore();
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(
    `TXR-W-${uid(10).toUpperCase()}`
  );

  useEffect(() => {
    const fetchCustomersAndProducts = async () => {
      setLoading(true);
      try {
        const [fetchedCustomers, allProducts] = await Promise.all([
          PeopleApis.searchCustomers(""),
          ProductApis.searchProducts(""),
        ]);
        setCustomers(fetchedCustomers);
        setProducts(allProducts);
      } catch (err) {
        toast.error(`Failed to load data: ${err.message}`);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomersAndProducts();
  }, [setLoading, setError, setCustomers, setProducts]);

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
    setSelectedCustomer(customers.length > 0 ? customers[0]._id : "");
  }, [customers]);

  const selectedCustomerDetails = useMemo(() => {
    return customers.find((s) => s._id === selectedCustomer);
  }, [selectedCustomer, customers]);

  const modalDetails = useMemo(
    () => ({
      returnInvoiceNumber: {
        label: "Return Invoice #",
        value: invoiceNumber,
      },
      originalSale: { label: "Original Sale #", value: "N/A" }, // No original sale for this form
      customer: {
        label: "Customer",
        value: `${selectedCustomerDetails?.name || "Walk-In-Customer"} ${
          selectedCustomerDetails?.email
            ? `(${selectedCustomerDetails.email})`
            : ""
        }`,
      },
      returnDate: {
        label: "Return Date",
        value: new Date().toLocaleDateString(),
      },
    }),
    [selectedCustomerDetails]
  );

  const modalItemsColumns = useMemo(
    () => [
      { key: "productName", label: "Product" },
      { key: "quantity", label: "Returned Qty" },
      {
        key: "salePriceAtReturn",
        label: "Price",
        render: (item) => `${item.salePriceAtReturn.toFixed(2)}`,
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
    <SaleReturnFormCommon
      titlePrefix="Sale Return (No Original Invoice)"
      initialInvoiceNumber={invoiceNumber}
      onInvoiceReset={() => {
        setInvoiceNumber(`TXR-W-${uid(10).toUpperCase()}`);
      }}
      onCartItemsInitialize={onCartItemsInitialize} // Pass the memoized empty cart initializer
      validateQuantity={validateQuantityWithoutInvoice}
      createReturnApi={SaleApis.createSaleReturn}
      detailsComponent={
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
          <h3 className="text-xl max-sm:text-lg font-semibold text-gray-800 mb-4">
            Sale Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="customerSelect"
                className="block max-sm:text-sm font-medium text-gray-700 mb-1"
              >
                Select Customer:
              </label>
              <select
                id="customerSelect"
                value={selectedCustomer}
                onChange={(e) => {
                  setSelectedCustomer(e.target.value);
                }}
                className="w-full max-sm:text-sm cursor-pointer p-2 border border-gray-300 bg-gray-100 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none appearance-none"
              >
                <option value="">Select a Customer</option>
                <option key={"Walk-in"} value={"walk-in-customer"}>
                  Walk-in Customer
                </option>
                {customers &&
                  customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name}
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
      searchComponent={<ProductSearchForSale products={products} />}
      modalTitle="Sale Return (Without Original Invoice)"
      modalDetails={modalDetails}
      modalItemsColumns={modalItemsColumns}
      resetFormSpecifics={resetFormSpecifics}
      customerId={selectedCustomer}
      customer_sale_details={
        selectedCustomer
          ? {
              customer: selectedCustomerDetails,
              sale: null,
            }
          : {}
      }
    />
  );
};

export default SaleReturnWithoutInvoice;
