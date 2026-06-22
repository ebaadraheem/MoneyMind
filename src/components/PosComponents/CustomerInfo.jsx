import { useState, useEffect, useCallback } from "react";
import useStore from "../../store/useStore";
import api from "../../services/api";
import { IconSearch, IconPersonAdd, IconDelete } from "../../utils/Icons";
import { toast } from "react-hot-toast";
import { SearchFromArray } from "../../utils/functions";

const POSCustomerInfo = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const {
    currentCustomer,
    setCurrentCustomer,
    removeCurrentCustomer,
    setLoading,
    setError,
    iswalkInCustomer,
    setwalkinCustomer,
    customers,
    openPersonFormModal,
    setCustomers,
  } = useStore();

  useEffect(() => {
    const fetchCustomers = async () => {
      if (customers.length > 0) return;
      setLoading(true);
      try {
        const response = await api.searchCustomers("");
        setCustomers(response);
      } catch (error) {
        setError("Failed to fetch customers.");
        toast.error("Failed to fetch customers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [setCustomers, setLoading, setError, customers]);

  const clearCurrentSelection = () => {
    removeCurrentCustomer();
    setwalkinCustomer(false);
  };

  const debouncedCustomerSearch = useCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setHighlightedIndex(-1);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const results = SearchFromArray(query, customers, [
          "name",
          "phone",
          "address",
        ]);
        setSearchResults(results);
        setHighlightedIndex(results.length > 0 ? 0 : -1);
      } catch (err) {
        setError("Failed to search customers.");
        toast.error("Failed to search customers. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, customers]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      debouncedCustomerSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, debouncedCustomerSearch]);
  const handleSelectCustomer = (customer) => {
    setCurrentCustomer(customer);
    setwalkinCustomer(false);
    setSearchTerm("");
    setSearchResults([]);
    setHighlightedIndex(-1);
  };

  const handleWalkInCustomer = () => {
    setwalkinCustomer(true);
    setCurrentCustomer(null);
    setSearchTerm("");
    setSearchResults([]);
    setHighlightedIndex(-1);
  };

  const handleAddCustomer = async () => {
    openPersonFormModal("customer", async (formData) => {
      setLoading(true);
      try {
        if (
          !formData.name ||
          !formData.phone ||
          !formData.address ||
          !formData.email
        ) {
          toast.error("Name, Phone, Address, Email are required fields.");
          setError("Name, Phone, Address, Email are required fields.");
          return;
        }
        const newCustomer = await api.addCustomer(formData);
        setCustomers([...customers, newCustomer]);
        handleSelectCustomer(newCustomer);
        toast.success(`Customer ${newCustomer.name} added successfully!`);
      } catch (err) {
        toast.error("Failed to add customer. Please try again.");
        setError("Failed to add customer.");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (highlightedIndex !== -1 && searchResults.length > 0) {
      handleSelectCustomer(searchResults[highlightedIndex]);
    } else {
      debouncedCustomerSearch(searchTerm);
    }
  };

  const handleKeyDown = (e) => {
    if (searchResults.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex !== -1) {
          handleSelectCustomer(searchResults[highlightedIndex]);
        }
      }
    }
  };

  // *** JSX STRUCTURE: The main changes are here ***
  return (
    <div className="bg-white sm:p-6 p-4 rounded-lg shadow-md mb-4 sm:mb-6">
      <h2 className="text-xl max-sm:text-lg font-bold text-blue-900/90 mb-4 flex items-center">
        <IconPersonAdd className="w-6 h-6 max-sm:w-5 max-sm:h-5 mr-2" />
        Customer Info
      </h2>

      <div className="mb-4">
        {currentCustomer || iswalkInCustomer ? (
          <div className="bg-blue-50 p-4 rounded-md flex flex-col sm:flex-row justify-between sm:items-center">
            <div>
              <p className="font-bold sm:text-lg text-blue-900/90">
                {iswalkInCustomer ? "Walk-in Customer" : "Selected Customer:"}
              </p>
              {!iswalkInCustomer && currentCustomer && (
                <>
                  <p className="text-gray-800 max-sm:text-sm">
                    <span className="font-semibold ">Name:</span>{" "}
                    {currentCustomer.name}
                  </p>
                  {currentCustomer.phone && (
                    <p className="text-gray-700 max-sm:text-sm">
                      <span className="font-semibold ">
                        Phone:
                      </span>{" "}
                      {currentCustomer.phone}
                    </p>
                  )}
                  {currentCustomer.address && (
                    <p className="text-gray-700 max-sm:text-sm">
                      <span className="font-semibold ">
                        Address:
                      </span>{" "}
                      {currentCustomer.address}
                    </p>
                  )}
                </>
              )}
            </div>
            <button
              onClick={clearCurrentSelection}
              className="mt-3 sm:mt-0 bg-red-600 max-sm:text-sm cursor-pointer text-white p-1 sm:p-2 rounded-md hover:bg-red-700 transition duration-200 text-sm flex items-center self-start sm:self-center"
            >
              <IconDelete className="w-4 h-4 " />
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <p className="text-gray-600">
              Search for a customer or select an option below.
            </p>
          </div>
        )}
      </div>

      <div>
        <div className="relative mb-4">
          <form onSubmit={handleFormSubmit} className="flex gap-3">
            <input
              type="text"
              placeholder="Search by name, phone, or Address..."
              className="flex-grow p-2 sm:p-3 max-sm:text-sm outline-none border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/90 focus:border-transparent transition duration-200"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHighlightedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              className="hover:bg-blue-900 bg-blue-900/90 cursor-pointer text-white p-2 sm:p-3 rounded-md transition duration-200 flex items-center"
            >
              <IconSearch className="w-5 h-5" />
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="absolute z-50 bg-white border border-gray-200 rounded-md w-full max-h-48 overflow-y-auto shadow-lg mt-1">
              {searchResults.map((customer, index) => (
                <div
                  key={customer._id}
                  className={`p-3 max-sm:text-sm cursor-pointer border-b border-gray-200 last:border-b-0 ${
                    index === highlightedIndex
                      ? "bg-blue-100"
                      : "hover:bg-blue-50"
                  }`}
                  onClick={() => handleSelectCustomer(customer)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <p className="font-semibold text-gray-800">{customer.name}</p>
                  <p className="text-sm text-gray-600">
                    {customer.phone || customer._id}
                  </p>
                </div>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchTerm.trim() && (
            <div className="absolute z-50 bg-white border border-gray-200 rounded-md w-full mt-1 p-3 text-center text-gray-600 shadow">
              <p>No customers found.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleWalkInCustomer}
            className="flex-1 max-sm:text-sm cursor-pointer bg-gray-500 text-white p-2 sm:p-3 rounded-md hover:bg-gray-600 transition duration-200 flex items-center justify-center"
          >
            Walk-in Customer
          </button>
          <button
            onClick={handleAddCustomer}
            className="flex-1 max-sm:text-sm cursor-pointer hover:bg-blue-900 bg-blue-900/90 text-white p-2 sm:p-3 rounded-md transition duration-200 flex items-center justify-center"
          >
            <IconPersonAdd className="w-5 h-5 mr-2" /> Add New Customer
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSCustomerInfo;
