import type { GridConfig } from "@helmapps/react-kendo-datagrid";

const isLocal = window.location.hostname === "localhost";

const API_BASE_GRID = isLocal
  ? "https://localhost:7212"
  : "http://10.131.175.181:8082";

  const API_BASE = isLocal
  ? "https://localhost:7117"
  : "http://10.131.175.181:8081";

export async function loadGridConfig(filename: string): Promise<GridConfig> {
  const res = await fetch(`${API_BASE_GRID}/Config/filename/${filename}/configType/Grid`);
  if (!res.ok) {
    throw new Error("Failed to load grid configuration");
  }
  console.log("Fetching grid config from:", `${API_BASE_GRID}/Config/filename/${filename}/configType/Grid`);  

  const config: GridConfig = await res.json();


  for (const widget of config.Widgets || []) {

    if ("DataSource" in widget && typeof widget.DataSource === "string" && widget.DataSource.startsWith("/")) {
      widget.DataSource = API_BASE + widget.DataSource;
    }
    if (Array.isArray((widget as any).Triggers)) {
          console.log("✅ Normalized Trigger URL:", widget);
      (widget as any).Triggers.forEach((trigger: any) => {
        if (trigger.url && typeof trigger.url === "string") {
          let cleanedUrl = trigger.url;

          // Prefix API_BASE only for leading "/"
          if (cleanedUrl.startsWith("/")) {
            cleanedUrl = API_BASE + cleanedUrl;
          }

          trigger.url = cleanedUrl;
          console.log("✅ Normalized Trigger URL:", cleanedUrl);
        }
      });
    }

    const actions = (widget as any).Actions;
    if (!Array.isArray(actions)) continue;

    for (const action of actions) {

      const modal = action.ModalConfig;
      if (!modal) continue;

      //Save/UpdateAPIURL
      if (modal.SaveAPIURL?.startsWith("/")) {
        modal.SaveAPIURL = API_BASE + modal.SaveAPIURL;
      }

      //DeleteURL
      if (modal.APIRequest?.URL?.startsWith("/")) {
        modal.APIRequest.URL = API_BASE + modal.APIRequest.URL;
      }

      //DropDownsURLs
      for (const field of modal.Fields || []) {
        const optionsApi = field.DropdownConfig?.OptionsAPI;
        if (optionsApi?.URL?.startsWith("/")) {
          optionsApi.URL = API_BASE + optionsApi.URL;
        }
      }
    }
  }
  return config;
}

export async function loadFilterConfig(filename: string): Promise<any> {
  const res = await fetch(`${API_BASE_GRID}/Config/filename/${filename}/configType/Filter`);
  if (!res.ok) {
    throw new Error("Failed to load filter configuration");
  }
  return await res.json();
}