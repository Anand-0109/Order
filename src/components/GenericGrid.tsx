import React, { useState, useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../App.css";
import { GridLayoutManager, type GridConfig, eventBus } from "@helmapps/react-kendo-datagrid";
import { loadGridConfig, loadFilterConfig } from "../Config/Order";
import { SmartFilter } from "@helmapps/smart-filter";
//import { useParams } from "react-router-dom";

const GenericGridPage: React.FC = () => {
  const gridName = "OrderManagement"; // dynamic grid name from URL
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

  const [filterConfig, setFilterConfig] = useState<any>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeGridId, setActiveGridId] = useState<string>("default-grid");

  useEffect(() => {
    if (gridConfig?.Widgets?.[0]?.Id) {
      setActiveGridId(gridConfig.Widgets[0].Id);
    }
    // Load filter config
    loadFilterConfigFile("filterconfiguration");
  }, [gridConfig]);

const loadFilterConfigFile = async (name: string) => {
  try {
    const config = await loadFilterConfig(name);
    setFilterConfig(config);
    console.log("✅ filterConfig loaded:", config); // Debug log
  } catch (error) {
    console.error("❌ Failed to load filter config:", error);
  }
};

  const handleGridAction = (action: any, _selectedItems?: any[], gridId?: string) => {
    console.log("Action triggered:", action, "from grid:", gridId);
    if (action.Handler === "onFilterClick" || action === "onFilterClick") {
      if (gridId) {
        setActiveGridId(gridId);
      }
      setIsFilterOpen(true);
       console.log("✅ isFilterOpen set to true"); // Debug log
    }
  };

  const handleQuerySubmit = (query: string, filterName?: string, description?: string) => {
    eventBus.publish("filterapplied", {
      query,
      filterName,
      description,
      gridId: activeGridId,
    });
    setIsFilterOpen(false);
  };

  // Check for configuration errors
  useEffect(() => {
    if (isFilterOpen && !filterConfig) {
      console.warn("⚠️ [GenericGrid] Filter requested but config is missing!");
      // Optionally notify user via toast or alert
      alert("Failed to load filter configuration. Please check the console/network logs.");
      setIsFilterOpen(false);
    }
  }, [isFilterOpen, filterConfig]);

  return (
    <div className="items-page-container relative">
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
          <GridLayoutManager
            config={gridConfig}
            onAction={handleGridAction}
          />
        ) : (
          <p>Error loading grid configuration.</p>
        )}
      </div>

      {filterConfig && isFilterOpen && (
        <SmartFilter
          config={filterConfig}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onQuerySubmit={handleQuerySubmit}
          Gridid={activeGridId}
          userId="1"
        />
      )}
    </div>
  );
};

export default GenericGridPage;
