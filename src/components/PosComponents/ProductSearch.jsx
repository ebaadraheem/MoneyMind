import { useState, useCallback, useEffect, useRef } from "react";
import useStore from "../../store/useStore";
import { IconSearch } from "../../utils/Icons";
import toast from "react-hot-toast";
import { SearchFromArray } from "../../utils/functions";
import ProductApis from "../../services/ProductApis";

const ProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [highlightedIndex, setHighlightedIndex] = useState(-1); 

  const {
    addProductToOrder,
    openModal,
    setLoading,
    setError,
    products,
    setProducts,
  } = useStore();

  const searchInputRef = useRef(null); 
  const resultsRef = useRef(null); 

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
        const filteredResults = results.filter((product) => product.stock > 0);
        setSearchResults(filteredResults);
        setHighlightedIndex(filteredResults.length > 0 ? 0 : -1); 
      } catch (err) {
        setError("Failed to search products.");
        toast.error("Failed to search products. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, products] 
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const allProducts = await ProductApis.searchProducts("");
        setProducts(allProducts);
      } catch (err) {
        setError("Failed to load products.");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [setLoading, setError, setProducts]);

  useEffect(() => {
    const handler = setTimeout(() => {
      debouncedSearch(searchTerm);
    }, 300);
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, debouncedSearch]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (highlightedIndex !== -1 && searchResults.length > 0) {
      const productToAdd = searchResults[highlightedIndex];
      const qty = quantities[productToAdd._id] || 1;
      handleAddProduct(productToAdd, qty);
    } else {
      debouncedSearch(searchTerm);
    }
  };

  const handleAddProduct = (product, qty) => {
    if (qty > 0) {
      addProductToOrder(product, qty);
      toast.success(`Added ${qty} x ${product.name} to order!`);
      setSearchTerm("");
      setSearchResults([]);
      setQuantities({}); 
      setHighlightedIndex(-1); 
      setSelectedProduct(null); 
      if (searchInputRef.current) {
        searchInputRef.current.focus(); 
      }
    } else {
      openModal("error", "Enter a valid quantity.");
    }
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (searchResults.length === 0) return;

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
          const productToAdd = searchResults[highlightedIndex];
          const qty = quantities[productToAdd._id] || 1;
          handleAddProduct(productToAdd, qty);
        }
      }
    },
    [searchResults, highlightedIndex, quantities, handleAddProduct]
  );
  
  useEffect(() => {
    if (resultsRef.current && highlightedIndex !== -1) {
      const highlightedItem = resultsRef.current.children[highlightedIndex];
      if (highlightedItem) {
        highlightedItem.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="bg-white sm:p-6 p-4 rounded-lg shadow-md mb-4 sm:mb-6">
      <h2 className="text-xl max-sm:text-lg font-bold text-blue-900/80 mb-3 sm:mb-4 flex items-center">
        <IconSearch className="w-6 h-6 max-sm:w-5 max-sm:h-5 mr-2" /> Product Search
      </h2>

      <div className="relative mb-4">
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <input
            ref={searchInputRef} 
            type="text"
            placeholder="Search by name or code..."
            className="flex-grow  max-sm:text-sm sm:p-3 p-2 outline-none border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900/80 focus:border-transparent transition duration-200"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedProduct(null);
              if (!e.target.value.trim()) {
                setSearchResults([]);
                setHighlightedIndex(-1); 
              }
            }}
            onKeyDown={handleKeyDown} 
          />
          <button
            type="submit"
            className="hover:bg-blue-900 text-white sm:p-3 p-2 rounded-md cursor-pointer bg-blue-900/90 transition duration-200 flex items-center"
          >
            <IconSearch className="w-5 h-5 " />
          </button>
        </form>

        {searchResults.length > 0 && !selectedProduct && (
          <div
            ref={resultsRef} 
            className="absolute z-50 bg-white border border-gray-200 rounded-md w-full max-h-48 overflow-y-auto shadow-lg mt-1"
          >
            {searchResults.map((product, index) => {
              const qty = quantities[product._id] || 1;

              // const handleQtyChange = (e) => {
              //   let value = Math.max(1, parseInt(e.target.value) || 1);
              //   if (value > product.stock) {
              //     value = product.stock; 
              //   }
              //   setQuantities((prev) => ({ ...prev, [product._id]: value }));
              // };

              return (
                <div
                  key={product._id}
                  className={`flex items-center justify-between gap-3 p-3 border-b border-gray-200 last:border-b-0 cursor-pointer
                    ${
                      index === highlightedIndex
                        ? "bg-blue-100"
                        : "hover:bg-blue-50"
                    } `} 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddProduct(product, qty);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddProduct(product, qty);
                    }
                  }}
                >
                  <div className="flex flex-col max-sm:text-sm flex-grow">
                    <p className="font-semibold text-gray-800">
                      {product.name} ({product.code})
                    </p>
                    <p className="text-sm max-sm:text-xs text-gray-600">
                     Price: {product.saleprice} - Stock:{" "}
                      {product.stock}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!selectedProduct &&
          searchTerm.trim() &&
          searchResults.length === 0 && (
            <div className="absolute z-50 max-sm:text-sm bg-white border border-gray-200 rounded-md w-full mt-1 p-3 text-center text-gray-600 shadow">
              No products found. Try a different search term.
            </div>
          )}
      </div>
    </div>
  );
};

export default ProductSearch;
