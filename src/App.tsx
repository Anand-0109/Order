import '@progress/kendo-licensing';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GenericGridPage from "./components/GenericGrid"; // Import the correct component

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<GenericGridPage />} // Use GenericGridPage here
        />
        {/* Add more routes if needed */}
      </Routes>
    </Router>
  );
}

export default App;