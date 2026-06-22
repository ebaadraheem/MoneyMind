import React, { useState, useEffect, useCallback, useRef } from "react";
import useStore from "../../store/useStore";
import toast from "react-hot-toast";
import { SearchFromArray } from "../../utils/functions";
import { IconSearch } from "../../utils/Icons";

const ProductSearchForSale = ({ onProductAdd, products }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saleQuantity, setSaleQuantity] = useState("1");
  const [salePrice, setSalePrice] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // New state for keyboard navigation

  const { setLoading, setError } = useStore();
  const searchInputRef = useRef(null); // Ref for the search input
  const resultsListRef = useRef(null); // Ref for the search results <ul>

  const debouncedSearch = useCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setHighlightedIndex(-1); // Reset highlight when query is empty
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const results = SearchFromArray(query, products, ["name", "code"]);
        setSearchResults(results);
        setHighlightedIndex(results.length > 0 ? 0 : -1); // Highlight first item or none
      } catch (err) {
        setError("Failed to search products.");
        toast.error("Failed to search products. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [products, setLoading, setError]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      debouncedSearch(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) &&
        resultsListRef.current &&
        !resultsListRef.current.contains(event.target)
      ) {
        // Only hide dropdown if nothing is selected and click is outside
        if (!selectedProduct) {
          setShowDropdown(false);
          setSearchResults([]); // Clear search results if user clicks outside without selecting
          setHighlightedIndex(-1);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedProduct]);

  // Effect to scroll the highlighted item into view
  useEffect(() => {
    if (resultsListRef.current && highlightedIndex !== -1) {
      const highlightedItem = resultsListRef.current.children[highlightedIndex];
      if (highlightedItem) {
        highlightedItem.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [highlightedIndex]);

  const handleProductSelect = useCallback((product) => {
    setSelectedProduct(product);
    const formattedSalePrice =
      product.saleprice !== undefined && product.saleprice !== null
        ? product.saleprice.toFixed(2)
        : ""; // Ensure it's empty string if no saleprice
    setSearchTerm(``);
    setSalePrice(formattedSalePrice); // Set actual cost price
    setSaleQuantity("1");
    setSearchResults([]); // Clear results after selection
    setShowDropdown(false); // Hide dropdown after selection
    setHighlightedIndex(-1); // Reset highlight
  }, []);

  const handleAddToCart = () => {
    toast.dismiss();
    if (!selectedProduct) {
      toast.error("Please select a product.");
      return;
    }
    const qty = parseInt(saleQuantity);
    const price = parseInt(salePrice);

    if (isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid positive quantity.");
      return;
    }
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid non-negative sale price.");
      return;
    }

    onProductAdd(selectedProduct, qty, price);
    setSelectedProduct(null);
    setSearchTerm("");
    setSaleQuantity("1");
    setSalePrice("");
    setSearchResults([]);
    setShowDropdown(false);
    setHighlightedIndex(-1);
    if (searchInputRef.current) {
      searchInputRef.current.focus(); // Focus back on search input
    }
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (searchResults.length === 0 || !showDropdown) return; // Only act if dropdown is visible and has results

      if (e.key === "ArrowDown") {
        e.preventDefault(); // Prevent cursor movement in input
        setHighlightedIndex((prevIndex) =>
          Math.min(prevIndex + 1, searchResults.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault(); // Prevent cursor movement in input
        setHighlightedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault(); // Prevent form submission
        if (highlightedIndex !== -1) {
          handleProductSelect(searchResults[highlightedIndex]);
        } else if (selectedProduct) {
          // If a product is already selected and Enter is pressed again, add to cart
          handleAddToCart();
        }
      }
    },
    [
      searchResults,
      highlightedIndex,
      showDropdown,
      selectedProduct,
      handleProductSelect,
      handleAddToCart,
    ]
  );

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-xl max-sm:text-lg font-semibold text-gray-800 mb-4">
        Add Product to Cart
      </h3>
      <div className="mb-4 relative">
        <label
          htmlFor="productSearch"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Search Product:
        </label>
        <form onSubmit={(e) => e.preventDefault()} className="relative">
          {" "}
          {/* Prevent default form submission on Enter */}
          <input
            id="productSearch"
            type="text"
            placeholder="Search by name or code"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // setSelectedProduct(null);
              // Only reset search results if the input is cleared
              if (!e.target.value.trim()) {
                setSearchResults([]);
                setHighlightedIndex(-1);
              }
              setShowDropdown(true); // Always show dropdown on change
            }}
            onFocus={() => {
              if (searchTerm.trim() !== "" || searchResults.length > 0) {
                setShowDropdown(true);
              }
            }}
            onKeyDown={handleKeyDown} // Add keydown listener here
            ref={searchInputRef} // Assign ref to input
            className="w-full max-sm:text-sm p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
          />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">
            <IconSearch className="w-5 h-5" />{" "}
          </div>
        </form>
        {showDropdown &&
          searchTerm.trim() !== "" &&
          searchResults.length > 0 && (
            <ul
              ref={resultsListRef} 
              className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
            >
              {searchResults.map((product, index) => (
                <li
                  key={product._id}
                  onClick={() => handleProductSelect(product)}
                  className={`p-2 cursor-pointer max-sm:text-sm flex justify-between items-center ${
                    index === highlightedIndex
                      ? "bg-blue-100"
                      : "hover:bg-blue-100"
                  }`}
                >
                  <span>
                    ({product.code}) {product.name} |{" "}
                    {product.saleprice?.toFixed(2) || "N/A"}{" "}
                  </span>
                  <span className="text-xs text-gray-500">
                    Stock: {product.stock || 0}
                  </span>
                </li>
              ))}
            </ul>
          )}
        {showDropdown &&
          searchTerm.trim() !== "" &&
          searchResults.length === 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 p-3 text-center text-gray-600">
              No products found matching your search.
            </div>
          )}
      </div>

      {selectedProduct && (
        <div className="mb-4 p-3 max-sm:text-sm bg-blue-50 rounded-md border border-blue-900/80">
          <p className="font-semibold text-blue-900/90">
            Selected Product: {selectedProduct.name} ({selectedProduct.code})
          </p>
          <p className="text-sm text-blue-900/80">
            Current Stock: {selectedProduct.stock || 0} | Sale Price:{" "}
            {selectedProduct.saleprice?.toFixed(2) || "N/A"}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="saleQuantity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Quantity:
          </label>
          <input
            id="saleQuantity"
            type="number"
            placeholder="Quantity"
            value={saleQuantity}
            onChange={(e) => setSaleQuantity(e.target.value)}
            onKeyDown={(e) => {
              // Allow Enter to add to cart from quantity field
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddToCart();
              }
            }}
            className="w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
            min="1"
            disabled={!selectedProduct}
          />
        </div>
        <div>
          <label
            htmlFor="salePrice"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Sale Price:
          </label>
          <input
            id="salePrice"
            type="number"
            placeholder="Sale Price"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)} // Re-enabled for manual price override
            onKeyDown={(e) => {
              // Allow Enter to add to cart from price field
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddToCart();
              }
            }}
            className="w-full max-sm:text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
            min="0" // Changed to 0.00 to allow free items
            step="1"
            disabled={!selectedProduct} // Only disable if no product is selected
          />
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        className={`w-full max-sm:text-sm px-4 py-2 bg-blue-900/80 text-white font-semibold ${
          selectedProduct ? "hover:bg-blue-900/95 cursor-pointer" : " bg-gray-400 cursor-not-allowed"
        } rounded transition-all}`}
        disabled={!selectedProduct}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductSearchForSale;
