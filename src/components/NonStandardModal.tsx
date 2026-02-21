import React, { useState, useEffect } from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { ComboBox } from '@progress/kendo-react-dropdowns';

interface NonStandardModalProps {
    onClose: () => void;
    onSave: (data: any) => void;
    isVisible: boolean;
}

const NonStandardModal: React.FC<NonStandardModalProps> = ({ onClose, onSave, isVisible }) => {

    // ---------------- FORM STATE ----------------
    const [formData, setFormData] = useState({
        type: 'non-standard',
        batchNum: 'MCA-091225-01',
        userBatchInput: '',
        workshop: 'TEST 1',
        workShopId: null as number | null,

        itemFilter: '',
        itemNumber: '',
        level: '',
        parentItem: '',
        packingInstructionFilter: '',
        packingInstruction: '',
        quantity: 5,
        customer: 'CustomerTest',
        batchType: 'Cover',
        labels: ['identification', 'odette'],
        odetteTemplate: 'Odette2',
        dateOnLabel: 'Actual',
        dateValue: new Date()
    });

    // ---------------- STATIC OPTIONS ----------------
   // const batchOptions = ['MCA-091225-01', 'MCA-091225-02', 'MCA-091225-03'];
    const levelOptions = ['LP'];
   // const customerOptions = ['CustomerTest', 'CustomerA', 'CustomerB'];
    const batchTypeOptions = ['Cover', 'Kit'];
   // const odetteTemplateOptions = ['Odette1', 'Odette2'];
    const packingInstructionOptions = [
    "Standard Packing",
    "Export Packing",
    "Bulk Packing",
    "Box Packing",
    "Special Handling"
];

    // ---------------- API ITEM NUMBERS ----------------
    const [itemOptions, setItemOptions] = useState<any[]>([]);
    const [loadingParts, setLoadingParts] = useState(false);

    const [workshops, setWorkshops] = useState<any[]>([]);
    const [loadingWorkshops, setLoadingWorkshops] = useState(false);


    // ---------------- AVAILABLE COMPONENTS STATE ----------------
    const [availableComponentsData, setAvailableComponentsData] = useState<any[]>([]);
    const [loadingComponents, setLoadingComponents] = useState(false);

    // ---------------- LOAD ITEM NUMBERS WHEN MODAL OPENS ----------------
    useEffect(() => {
        if (!isVisible) return;

        const loadInitialData = async () => {
            try {

                // ---- LOAD WORKSHOPS ----
                setLoadingWorkshops(true);

                const workshopRes = await fetch(
                    "https://localhost:7117/Order/GetWorkshops"
                );
                const workshopData = await workshopRes.json();

                if (workshopData?.result) {
                    setWorkshops(workshopData.result);
                } else {
                    setWorkshops([]);
                }

                // ---- LOAD PART NUMBERS ----
                setLoadingParts(true);

                const response = await fetch(
                    "https://localhost:7117/Order/GetKitOrCover"
                );
                const data = await response.json();

                if (data?.result) {
                    setItemOptions(data.result);
                } else {
                    setItemOptions([]);
                }

            } catch (error) {
                console.error("Error loading initial data:", error);
                setWorkshops([]);
                setItemOptions([]);
            } finally {
                setLoadingWorkshops(false);
                setLoadingParts(false);
            }
        };

        loadInitialData();

    }, [isVisible]);

    useEffect(() => {

        if (!formData.workShopId) {
            setAvailableMachinesData([]);
            return;
        }

        const loadMachines = async () => {
            try {
                setLoadingMachines(true);

                const response = await fetch(
                    `https://localhost:7117/Order/GetAvailableMachines/workshopId/${formData.workShopId}`
                );

                const data = await response.json();

                console.log("Machines API:", data);

                if (data?.result) {
                    setAvailableMachinesData(data.result);
                } else {
                    setAvailableMachinesData([]);
                }

            } catch (error) {
                console.error("Error loading machines:", error);
                setAvailableMachinesData([]);
            } finally {
                setLoadingMachines(false);
            }
        };

        loadMachines();

    }, [formData.workShopId]);


    // ---------------- LOAD AVAILABLE COMPONENTS WHEN ITEM CHANGES ----------------
    useEffect(() => {

        if (!formData.itemNumber) {
            setAvailableComponentsData([]);
            return;
        }

        const loadComponents = async () => {
            try {
                setLoadingComponents(true);

                const response = await fetch(
                    `https://localhost:7117/Order/GetAvailableComponents/itemNumber/${formData.itemNumber}`
                );

                const data = await response.json();

                console.log("Components API:", data);

                if (data?.result) {
                    setAvailableComponentsData(data.result);
                } else {
                    setAvailableComponentsData([]);
                }

            } catch (error) {
                console.error("Error loading components:", error);
                setAvailableComponentsData([]);
            } finally {
                setLoadingComponents(false);
            }
        };

        loadComponents();

    }, [formData.itemNumber]);

    // ---------------- OTHER GRID DATA ----------------
    const [availableMachinesData, setAvailableMachinesData] = useState<any[]>([]);
    const [loadingMachines, setLoadingMachines] = useState(false);

    // sewedComponentsData is empty by default
    const [sewedComponentsData, setSewedComponentsData] = useState<any[]>([]);

    // HANDLER FOR ARRANGE BUTTON
    const handleArrange = () => {
        if (availableComponentsData.length > 0 && availableMachinesData.length > 0) {
            // Create new sewed components from available components
            const newSewedComponents = availableComponentsData.map((comp, index) => ({
                component: comp.partNumber || 'C307SPORTY LEATH...',
                itemNumber: comp.partNumber || formData.itemNumber,
                sew: formData.quantity || 5,
                bfQty: formData.quantity || 5,
                machine: availableMachinesData[index % availableMachinesData.length]?.machineName || '990 FB [4]',
                level: comp.revLevel || formData.level || '5',
                packingInstruction: formData.packingInstruction || 'Standard Packing',
                quantity: formData.quantity || 5
            }));
            
            // Update the sewed components data
            setSewedComponentsData(newSewedComponents);
            
            console.log("Arranged components:", newSewedComponents);
        } else {
            alert("Please select Item Number and ensure machines are available");
        }
    };

    if (!isVisible) return null;


const handleSave = async () => {
    try {

        // ----- map production type -----
        const getProductionTypeNumber = (type: string): number => {
            switch (type) {
                case 'Cover': return 1;
                case 'Kit': return 2;
                default: return 1;
            }
        };

        // ----- map batch type -----
        const getBatchTypeNumber = (type: string): number => {
            switch (type) {
                case 'standard': return 1;
                case 'non-standard': return 2;
                default: return 1;
            }
        };

        // ----- process status -----
        const getProcessStatus = (): string => {
            return "New";
        };

        // ----- get selected part -----
        const selectedPart = itemOptions.find(
            x => x.partNumber === formData.itemNumber
        );

        if (!selectedPart) {
            alert("Please select Item Number");
            return;
        }

        // ----- payload matching AddOrderDTO -----
        const payload = {
            orderReference: formData.batchNum,
            processStatus: getProcessStatus(),
            workShopId: formData.workShopId,
            productionType: getProductionTypeNumber(formData.batchType),
            batchType: getBatchTypeNumber(formData.type),

            quantity: formData.quantity,
            packingInstruction: formData.packingInstruction,

            printIdentificationLabels: formData.labels.includes('identification'),
            printOdetteLabels: formData.labels.includes('odette'),
            partId: selectedPart.id,
            poNumber: formData.batchNum,  // change if you add PO field in UI
            availableComponents : JSON.stringify(availableComponentsData),
            availableMachines : JSON.stringify(availableMachinesData),
            sewedComponents : JSON.stringify(sewedComponentsData)
        };

        console.log("Saving payload:", payload);

        // ----- validations -----
        if (!payload.orderReference) {
            alert("Batch number is required");
            return;
        }

        if (!payload.workShopId) {
            alert("Workshop is required");
            return;
        }

        // ----- API CALL -----
        const response = await fetch(
            "https://localhost:7117/Order",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result?.message || "Save failed");
        }

        console.log("Saved:", result);

        // notify parent + close modal
        onSave(result);
        onClose();

    } catch (err) {
        console.error("Save error:", err);
        alert(err instanceof Error ? err.message : "Failed to save order");
    }
};


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">


            <div className="bg-white rounded-xl shadow-2xl w-[1100px] max-h-[95vh] flex flex-col border border-gray-300">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
                    <h3 className="text-xl font-semibold text-gray-800">Order Properties</h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-6 text-sm bg-gray-50">

                    {/* Main Form Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-5">
                        <div className="flex gap-8">

                            {/* LEFT COLUMN */}
                            <div className="flex-1 flex flex-col gap-4">

                                {/* TYPE */}
                                <div className="flex items-center gap-4">
                                    <label className="font-semibold text-gray-700 w-32 text-sm">Type</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={formData.type === 'standard'}
                                                onChange={() => setFormData({ ...formData, type: 'standard' })}
                                                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700">Standard</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={formData.type === 'non-standard'}
                                                onChange={() => setFormData({ ...formData, type: 'non-standard' })}
                                                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700">Non-Standard</span>
                                        </label>
                                    </div>
                                </div>

                           {/* BATCH NUMBER / ORDER REFERENCE */}
<div className="flex items-center gap-4">
    <label className="font-semibold text-gray-700 w-32 text-sm">Batch Number</label>
    <input
        type="text"
        placeholder="Enter order reference"
        className="k-input k-input-md k-rounded-md k-input-solid flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        value={formData.batchNum}
        onChange={(e) =>
            setFormData({
                ...formData,
                batchNum: e.target.value
            })
        }
    />
</div>

                              
                                {/* WORKSHOP */}
                                <div className="flex items-center gap-4">
                                    <label className="font-semibold text-gray-700 w-32 text-sm">Workshop</label>
                                    <ComboBox
                                        data={workshops}
                                        textField="workShopName"
                                        dataItemKey="id"
                                        value={workshops.find(x => x.id === formData.workShopId) || null}
                                        loading={loadingWorkshops}
                                        filterable
                                        placeholder="Select workshop"
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                workShopId: e.value?.id ?? null
                                            })
                                        }
                                        style={{ flex: 1 }}
                                        className="shadow-sm"
                                    />
                                </div>

                                {/* ITEM NUMBER */}
                                <div className="flex items-center gap-4">
                                    <label className="font-semibold text-gray-700 w-32 text-sm">Item Number</label>
                                    <ComboBox
                                        data={itemOptions}
                                        textField="partNumber"
                                        dataItemKey="id"
                                        value={itemOptions.find(x => x.partNumber === formData.itemNumber) || null}
                                        loading={loadingParts}
                                        filterable
                                        placeholder={loadingParts ? "Loading..." : "Select itemNumber"}
                                        onChange={(e) => {
                                            const selected = e.value;
                                            setFormData({
                                                ...formData,
                                                itemNumber: selected?.partNumber || "",
                                                batchType: selected?.partType || ""
                                            });
                                        }}
                                        style={{ flex: 1 }}
                                        className="shadow-sm"
                                    />
                                </div>

                                {/* LEVEL */}
                                <div className="flex items-center gap-4">
                                    <label className="font-semibold text-gray-700 w-32 text-sm">Level</label>
                                    <ComboBox
                                        data={levelOptions}
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.value })}
                                        style={{ flex: 1 }}
                                        placeholder="Select Level"
                                        className="shadow-sm"
                                    />
                                </div>

                                

                                 {/* PACKING INSTRUCTION FILTER */}
{/* <div className="flex items-center gap-4">
    <label className="font-semibold text-gray-700 w-32 text-sm">Packing Filter</label>
    <input
        type="text"
        placeholder="Search packing instruction"
        className="k-input k-input-md k-rounded-md k-input-solid flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        value={formData.packingInstructionFilter}
        onChange={(e) =>
            setFormData({
                ...formData,
                packingInstructionFilter: e.target.value
            })
        }
    />
</div> */}

{/* PACKING INSTRUCTION DROPDOWN */}
<div className="flex items-center gap-4">
    <label className="font-semibold text-gray-700 w-32 text-sm">Packing Instruction</label>
   <ComboBox
    data={packingInstructionOptions}
    value={formData.packingInstruction}
    placeholder="Select packing instruction"
    onChange={(e) =>
        setFormData({
            ...formData,
            packingInstruction: e.value
        })
    }
    style={{ flex: 1 }}
    className="shadow-sm"
/>
</div>


{/* QUANTITY */}
                                <div className="flex items-center gap-4">
                                    <label className="font-semibold text-gray-700 w-32 text-sm">Quantity</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="Enter quantity"
                                        className="k-input k-input-md k-rounded-md k-input-solid flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                        value={formData.quantity}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^\d*$/.test(value)) {
                                                setFormData({
                                                    ...formData,
                                                    quantity: value === "" ? 0 : parseInt(value)
                                                });
                                            }
                                        }}
                                    />
                                </div>


                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="flex-1 flex flex-col gap-4 pl-8 border-l border-gray-200">

                                {/* PRODUCTION TYPE */}
                                <div className="flex items-center gap-4">
                                    <label className="font-semibold text-gray-700 w-36 text-sm">Production Type</label>
                                    <ComboBox
                                        data={batchTypeOptions}
                                        value={formData.batchType}
                                        disabled={true}
                                        onChange={(e) => setFormData({ ...formData, batchType: e.value })}
                                        style={{ flex: 1 }}
                                        className="shadow-sm"
                                    />
                                </div>

                                {/* LABELS */}
                                <div className="flex items-start gap-4">
                                    <label className="font-semibold text-gray-700 w-36 text-sm pt-1">Labels</label>
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.labels.includes('identification')}
                                                onChange={(e) => {
                                                    const updated = e.target.checked
                                                        ? [...formData.labels, 'identification']
                                                        : formData.labels.filter(l => l !== 'identification');
                                                    setFormData({ ...formData, labels: updated });
                                                }}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700 group-hover:text-gray-900">Print identification labels</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.labels.includes('odette')}
                                                onChange={(e) => {
                                                    const updated = e.target.checked
                                                        ? [...formData.labels, 'odette']
                                                        : formData.labels.filter(l => l !== 'odette');
                                                    setFormData({ ...formData, labels: updated });
                                                }}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700 group-hover:text-gray-900">Print Odette labels</span>
                                        </label>
                                    </div>
                                </div>

                                {/* ODETTE TEMPLATE */}
                               {/*  <div className="flex items-center gap-4">
                                    <label className="font-semibold text-gray-700 w-36 text-sm">Odette Template</label>
                                    <ComboBox
                                        data={odetteTemplateOptions}
                                        value={formData.odetteTemplate}
                                        onChange={(e) => setFormData({ ...formData, odetteTemplate: e.value })}
                                        style={{ flex: 1 }}
                                        className="shadow-sm"
                                    />
                                </div> */}

                            </div>

                        </div>
                    </div>

                    {/* Components & Machines Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-5">
                        <div className="flex h-56 gap-4">

                            {/* Available Components */}
                            <div className="flex-1 flex flex-col">
                                <div className="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-200 font-semibold rounded-t-lg text-sm text-gray-800">
                                    Available Components
                                </div>
                                <div className="flex-1 border-x border-b border-gray-200 overflow-hidden rounded-b-lg">
                                    <Grid data={availableComponentsData} style={{ height: '100%', border: 'none' }}>
                                        <GridColumn field="partNumber" title="Part Number" />
                                        <GridColumn field="revLevel" title="Rev Level" width="120px" />
                                    </Grid>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col justify-center gap-3">
                                <button 
                                    onClick={handleArrange}
                                    className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 shadow-sm hover:shadow-md"
                                >
                                    Arrange
                                </button>
                                <button
                                    disabled
                                    className="px-5 py-2.5 bg-gray-200 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed shadow-sm"
                                >
                                    Automatic
                                </button>
                                <button
                                    className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors duration-200 shadow-sm hover:shadow-md"
                                    onClick={() => {
                                        setAvailableComponentsData([]);
                                        setAvailableMachinesData([]);
                                    }}
                                >
                                    Delete
                                </button>
                            </div>

                            {/* Available Machines */}
                            <div className="flex-1 flex flex-col">
                                <div className="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-200 font-semibold rounded-t-lg text-sm text-gray-800">
                                    Available Machines
                                </div>
                                <div className="flex-1 border-x border-b border-gray-200 overflow-hidden rounded-b-lg">
                                    <Grid data={availableMachinesData} style={{ height: '100%', border: 'none' }}>
                                        <GridColumn field="machineName" title="Machine" />
                                    </Grid>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Sewed Components Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 font-semibold text-sm text-gray-800">
                            Sewed Components
                        </div>
                        <Grid data={sewedComponentsData} style={{ height: 220, border: 'none' }}>
                            <GridColumn field="component" title="Component" />
                            <GridColumn field="itemNumber" title="Item Number" />
                            <GridColumn field="sew" title="Sew" />
                            <GridColumn field="quantity" title="Quantity" width="100px" />
                            <GridColumn field="packingInstruction" title="Packing Instruction" width="150px" />
                            <GridColumn field="level" title="Level" width="80px" />
                            <GridColumn field="machine" title="Machine" />
                        </Grid>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
                    <button 
                 onClick={handleSave}

                        className="px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                        Save
                    </button>
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2.5 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 active:bg-gray-800 transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
};

export default NonStandardModal;