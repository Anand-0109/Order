import React, { useState, useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
// import "../App.css"; // Assuming App.css is in src/ 
import { GridLayoutManager, type GridConfig} from "@helmapps/react-kendo-datagrid";
// import combinedOrdersConfig from "../Config/CombinedOrdersConfig.json";
import { loadGridConfig } from "../Config/Order";

const CombinedOrdersPage: React.FC = () => {
    const [gridConfig, setGridConfig] = useState<GridConfig | null>(null);
    const [loadingConfig, setLoadingConfig] = useState(true);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                // Determine the config name. 
                // If the dynamic config store uses "CombinedOrders", we use that here.
                const configName = "CombinedOrderConfig";
                console.log("Loading grid config for:", configName);

                const config = await loadGridConfig(configName);
                setGridConfig(config);
            } catch (error) {
                console.error("Failed to load grid config:", error);
            } finally {
                setLoadingConfig(false);
            }
        };

        loadConfig();
    }, []);

    // const [filterConfig, setFilterConfig] = useState<any>(null); // Add filter config loading if needed
    // const [isFilterOpen, setIsFilterOpen] = useState(false);
    // const [activeGridId, setActiveGridId] = useState<string>("combined-orders-grid");


    const handleGridAction = (action: any, _selectedItems?: any[], gridId?: string) => {
        console.log("Action triggered:", action, "from grid:", gridId);
        //  if (action.Handler === "onFilterClick" || action === "onFilterClick") {
        //   if (gridId) {
        //     setActiveGridId(gridId);
        //   }
        //   setIsFilterOpen(true);
        // }
    };

    //    const handleQuerySubmit = (query: string, filterName?: string, description?: string) => {
    //     eventBus.publish("filterapplied", {
    //       query,
    //       filterName,
    //       description,
    //       gridId: activeGridId,
    //     });
    //     setIsFilterOpen(false);
    //   };

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
            {/* {filterConfig && isFilterOpen && (
        <SmartFilter
          config={filterConfig}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onQuerySubmit={handleQuerySubmit}
          Gridid={activeGridId}
          userId="1"
        />
      )} */}
        </div>
    );
};

export default CombinedOrdersPage;
