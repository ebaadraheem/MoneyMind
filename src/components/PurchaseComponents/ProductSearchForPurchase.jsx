import React, { useState, useEffect, useCallback, useRef } from "react";
import useStore from "../../store/useStore";
import toast from "react-hot-toast";
import { SearchFromArray } from "../../utils/functions";
import { IconSearch } from "../../utils/Icons";

/**
 * @param {object} props
 * @param {function} props.onProductAdd
 */
const ProductSearchForPurchase = ({ onProductAdd, products }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState("1");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const { setLoading, setError } = useStore();
  const searchInputRef = useRef(null);
  const resultsListRef = useRef(null);

  const debouncedSearch = useCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setHighlightedIndex(-1);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const results = SearchFromArray(query, products, ["name", "code"]);
        setSearchResults(results);
        setHighlightedIndex(results.length > 0 ? 0 : -1);
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
        if (!selectedProduct) {
          setShowDropdown(false);
          setSearchResults([]);
          setHighlightedIndex(-1);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedProduct]);
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
    const formattedCostPrice =
      product.costprice !== undefined && product.costprice !== null
        ? product.costprice.toFixed(2)
        : "";
    setSearchTerm(``);
    setPurchasePrice(formattedCostPrice);
    setPurchaseQuantity("1");
    setSearchResults([]);
    setShowDropdown(false);
    setHighlightedIndex(-1);
  }, []);

  const handleAddToCart = () => {
    toast.dismiss();
    if (!selectedProduct) {
      toast.error("Please select a product.");
      return;
    }
    const qty = parseInt(purchaseQuantity);
    const price = parseInt(purchasePrice);

    if (isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid positive quantity.");
      return;
    }
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid non-negative purchase price.");
      return;
    }

    onProductAdd(selectedProduct, qty, price);
    setSelectedProduct(null);
    setSearchTerm("");
    setPurchaseQuantity("1");
    setPurchasePrice("");
    setSearchResults([]);
    setShowDropdown(false);
    setHighlightedIndex(-1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (searchResults.length === 0 || !showDropdown) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prevIndex) =>
          Math.min(prevIndex + 1, searchResults.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex !== -1) {
          handleProductSelect(searchResults[highlightedIndex]);
        } else if (selectedProduct) {
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
          <input
            id="productSearch"
            type="text"
            placeholder="Search by name or code"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // setSelectedProduct(null);
              if (!e.target.value.trim()) {
                setSearchResults([]);
                setHighlightedIndex(-1);
              }
              setShowDropdown(true);
            }}
            onFocus={() => {
              if (searchTerm.trim() !== "" || searchResults.length > 0) {
                setShowDropdown(true);
              }
            }}
            onKeyDown={handleKeyDown}
            ref={searchInputRef}
            className="w-full pl-10 max-sm:text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
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
                  className={`p-2 max-sm:text-sm cursor-pointer flex justify-between items-center ${
                    index === highlightedIndex
                      ? "bg-blue-100"
                      : "hover:bg-blue-100"
                  }`}
                >
                  <span>
                    ({product.code}) {product.name} |{" "}
                    {product.costprice?.toFixed(2) || "N/A"}{" "}
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
        <div className="mb-4 max-sm:text-sm p-3 bg-blue-50 rounded-md border border-blue-900/80">
          <p className="font-semibold text-blue-900/90">
            Selected Product: {selectedProduct.name} ({selectedProduct.code})
          </p>
          <p className="text-sm text-blue-900/80">
            Current Stock: {selectedProduct.stock || 0} | Cost Price:{" "}
            {selectedProduct.costprice?.toFixed(2) || "N/A"}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="purchaseQuantity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Quantity:
          </label>
          <input
            id="purchaseQuantity"
            type="number"
            placeholder="Quantity"
            value={purchaseQuantity}
            onChange={(e) => setPurchaseQuantity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddToCart();
              }
            }}
            className="w-full max-sm:text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
            min="1"
            disabled={!selectedProduct}
          />
        </div>
        <div>
          <label
            htmlFor="purchasePrice"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Cost Price:
          </label>
          <input
            id="purchasePrice"
            type="number"
            placeholder="Cost Price"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddToCart();
              }
            }}
            className="w-full max-sm:text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200 outline-none"
            min="0"
            step="1"
            disabled={!selectedProduct}
          />
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        className={`w-full max-sm:text-sm px-4 py-2 bg-blue-900/80 text-white font-semibold ${
          selectedProduct
            ? "hover:bg-blue-900/95 cursor-pointer"
            : "bg-gray-400 cursor-not-allowed"
        } rounded  transition-all}`}
        disabled={!selectedProduct}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductSearchForPurchase;
