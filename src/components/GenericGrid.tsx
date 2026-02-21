import React, { useState, useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../App.css";
import { GridLayoutManager, type GridConfig, eventBus } from "@helmapps/react-kendo-datagrid";
import { loadGridConfig, loadFilterConfig } from "../Config/Order";
import { useParams } from "react-router-dom";
import { SmartFilter } from "@helmapps/smart-filter";

import NonStandardModal from "./NonStandardModal";

const GenericGridPage: React.FC = () => {
  const gridName  = "OrderManagement" // dynamic grid name from URL
  const [gridConfig, setGridConfig] = useState<GridConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // SmartFilter State
  const [filterConfig, setFilterConfig] = useState<any>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNonStandardModalOpen, setIsNonStandardModalOpen] = useState(false);

  useEffect(() => {
    console.log("🔄 [GenericGridPage] gridName changed to:", gridName);

    // Reset state when gridName changes to prevent stale data
    setGridConfig(null);
    setLoadingConfig(true);

    if (gridName) {
      loadGridConfigFile(gridName);
      // Load filter config (assuming standard name or mapping, here hardcoded as requested 'filterconfiguration')
      loadFilterConfigFile("filterconfiguration");
    } else {
      console.warn("⚠️ [GenericGridPage] No gridName parameter found!");
    }
  }, [gridName]);

  const loadGridConfigFile = async (name: string) => {
    try {
      console.log("📥 [GenericGridPage] fetching grid config for:", name);
      const start = Date.now();
      const config = await loadGridConfig(name);
      console.log(`✅ [GenericGridPage] Grid config loaded for ${name} in ${Date.now() - start}ms`, config);

      if (!config) {
        console.error("❌ [GenericGridPage] Loaded grid config is null/undefined!");
      }

      setGridConfig(config);
    } catch (error) {
      console.error("❌ [GenericGridPage] Failed to load grid config:", error);
    } finally {
      setLoadingConfig(false);
    }
  };

  const loadFilterConfigFile = async (name: string) => {
    try {
      const config = await loadFilterConfig(name);
      setFilterConfig(config);
    } catch (error) {
      console.error("❌ [GenericGridPage] Failed to load filter config:", error);
    }
  };

  const activeGridId = gridConfig?.Widgets?.[0]?.Id || "default-grid";

  // Handlers for Grid Actions
  const handleGridAction = (action: any, _item: any) => {
    console.log("Action triggered:", action);
    // Check for the "Smart Filter" handler
    if (action.Handler === "onFilterClick" || action === "onFilterClick" || action.Name === "Smart Filter") {
      setIsFilterOpen(true);
    }
    // Check for Custom Action: NonStandardPacking
    else if (action === "onCustomAction" || action.Id === "NonStandardPacking" || action.Name === "Non-Standard Packing") {
      setIsNonStandardModalOpen(true);
    }
    // Add other handlers here if necessary, or let GridLayoutManager handle default CRUD
  };

  const handleQuerySubmit = (query: string, filterName?: string, description?: string) => {
    // Publish event via eventBus - Grid will automatically listen and refetch data
    eventBus.publish("filterapplied", {
      query,
      filterName,
      description,
      gridId: activeGridId,
    });

    setIsFilterOpen(false);
  };

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
          // Add key={gridName} to force remount of GridLayoutManager when grid changes
          <GridLayoutManager
            key={gridName}
            config={gridConfig}
            onAction={handleGridAction}
          />
        ) : (
          <p>Error loading grid configuration.</p>
        )}
      </div>

      {/* Smart Filter Component - Only render when open to avoid redundant trigger icon */}
      {filterConfig && isFilterOpen && (
        <SmartFilter
          config={filterConfig}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onQuerySubmit={handleQuerySubmit}
          Gridid={activeGridId}
          userId="1" // Replace with actual user context if available
        />
      )}

      {/* Non-Standard Packing Modal */}
      {isNonStandardModalOpen && (
        <NonStandardModal
          isVisible={isNonStandardModalOpen}
          onClose={() => setIsNonStandardModalOpen(false)}
          onSave={(data) => {
            console.log("Saved Non-Standard Packing:", data);
            setIsNonStandardModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default GenericGridPage;