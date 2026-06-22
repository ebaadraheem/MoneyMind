import { useState, useEffect, useMemo, useCallback } from "react";
import useStore from "../store/useStore";
import ProductApis from "../services/ProductApis";
import EntityTable from "../components/ProductComponents/EntityTable";
import { motion } from "framer-motion";

const tableConfigs = {
  products: {
    title: "Product",
    icon: "/product-management-blue.png",
    emptyMessage: "No products found.",
    fetchEntities: () => ProductApis.searchProducts(""),
    storeKeys: ["products", "setProducts", "openProductFormModal"],
    onDeleteEntity: (action, id, data) => {
      if (action === "delete") return ProductApis.deleteProduct(id);
      if (action === "update") return ProductApis.updateProduct(id, data);
      if (action === "create") return ProductApis.addProduct(data);
    },
    columns: [
      { key: "name", label: "Name" },
      { key: "code", label: "Code" },
      {
        key: "saleprice",
        label: "Sale Price",
        render: (item) => (item.saleprice ? item.saleprice.toFixed(2) : "0.00"),
      },
      
    ],
  },
  categories: {
    title: "Category",
    icon: "/categories-blue.png",
    emptyMessage: "No categories found.",
    fetchEntities: () => ProductApis.getCategories(),
    storeKeys: ["categories", "setCategories", "openCategoryUOMFormModal"],
    onDeleteEntity: (action, id, data) => {
      if (action === "delete") return ProductApis.deleteCategory(id);
      if (action === "update") return ProductApis.updateCategory(id, data);
      if (action === "create") return ProductApis.addCategory(data);
    },
    columns: [{ key: "name", label: "Name" }],
  },
  uoms: {
    title: "UOM",
    icon: "/ruler-blue.png",
    emptyMessage: "No UOMs found.",
    fetchEntities: () => ProductApis.getUOMs(),
    storeKeys: ["uoms", "setUOMs", "openCategoryUOMFormModal"],
    onDeleteEntity: (action, id, data) => {
      if (action === "delete") return ProductApis.deleteUOM(id);
      if (action === "update") return ProductApis.updateUOM(id, data);
      if (action === "create") return ProductApis.addUOM(data);
    },
    columns: [{ key: "name", label: "Name" }],
  },
};

const ProductManagementSection = () => {
  const {
    userAccesses,
    currentView,
    setCurrentView,
    setLoading,
    setError,
    openModal,
    ...store
  } = useStore();

  const hasAccess = userAccesses.includes("product-management");

  const [activeTab, setActiveTab] = useState(() => {
    return tableConfigs[currentView] ? currentView : "products";
  });

  useEffect(() => {
    if (tableConfigs[currentView] && currentView !== activeTab) {
      setActiveTab(currentView);
    }
  }, [currentView, activeTab]);

  if (!hasAccess) {
    return (
      <motion.div
        key="product-management-access-denied"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        className="bg-white p-6 rounded-lg shadow-md mx-auto my-8 w-full text-center text-gray-600"
      >
        <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
        <p className="text-lg">
          You do not have permission to view product management sections.
        </p>
        <p className="text-md mt-2">Please contact your administrator.</p>
      </motion.div>
    );
  }

  const config = tableConfigs[activeTab];
  if (!config) return null;

  const [entities, setEntities, openFormModal] = config.storeKeys.map(
    (key) => store[key]
  );

  return (
    <div className="mt-4">
    
      <EntityTable
        title={config.title}
        icon={config.icon}
        entityKey={activeTab}
        emptyMessage={config.emptyMessage}
        fetchEntities={config.fetchEntities}
        entities={entities}
        setEntities={setEntities}
        openFormModal={openFormModal}
        onDeleteEntity={config.onDeleteEntity}
        columns={config.columns}
        setLoading={setLoading}
        setError={setError}
        openModal={openModal}
      />
    </div>
  );
};

export default ProductManagementSection;
