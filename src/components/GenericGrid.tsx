import React, { useState, useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../App.css";
import { GridLayoutManager,  type GridConfig } from "@abhimanew2000/react-kendo-datagrid";
import { loadGridConfig } from "../Config/Order";
//import { useParams } from "react-router-dom";

const GenericGridPage: React.FC = () => {
  const  gridName  = "OrderManagement"; // dynamic grid name from URL
  const [gridConfig, setGridConfig] = useState<GridConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    if (gridName) loadGridConfigFile(gridName);
  }, [gridName]);

  const loadGridConfigFile = async (name: string) => {
    try {
      console.log("Loading grid config for:", name);
      const config = await loadGridConfig(name);
      setGridConfig(config);
    } catch (error) {
      console.error("Failed to load grid config:", error);
    } finally {
      setLoadingConfig(false);
    }
  };

  
  return (
    <div className="items-page-container">
      <div
        className="kendo-grid-isolation"
        style={{
          width: "100%",
          overflowX: "auto",
          overflowY: "visible",
        }}
      >
        {loadingConfig ? (
          <p>Loading grid...</p>
        ) : gridConfig ? (
          <GridLayoutManager config={gridConfig} />
        ) : (
          <p>Error loading grid configuration.</p>
        )}
      </div>
    </div>
  );
};

export default GenericGridPage;
