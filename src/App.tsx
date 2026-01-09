import '@progress/kendo-licensing';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import GenericGrid from "./components/GenericGrid";


function App() {
  return(
    <div>

      <Router>
     

          <Routes>
            <Route
              path="/"
              element={<GenericGrid />}
            />
        
          </Routes>
    </Router>
       
    </div>
  )
 
}

export default App;



