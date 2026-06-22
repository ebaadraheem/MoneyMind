import { useState } from "react";
import { motion } from "framer-motion";
import GenericListReport from "./GenericList/GenericListReport";
import ProductApis from "../../services/ProductApis";

const InventoryReportContainer = () => {
  const renderReportComponent = () => {
    return (
      <GenericListReport
        title="Inventory Report"
        fetchApi={() => ProductApis.searchProducts("")}
        columns={[
          { key: "name", header: "Name", printable: true },
          { key: "code", header: "Code", printable: true },
          { key: "category", header: "Category", printable: true }, // Assuming API provides this
          { key: "uom", header: "UOM", printable: false }, // Assuming API provides this
          { key: "costprice", header: "Cost Price", printable: true },
          { key: "saleprice", header: "Sale Price", printable: true },
          { key: "stock", header: "Stock", printable: true },
        ]}
      />
    );
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <motion.div
        key={"products-list"}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {renderReportComponent()}
      </motion.div>
    </div>
  );
};

export default InventoryReportContainer;
