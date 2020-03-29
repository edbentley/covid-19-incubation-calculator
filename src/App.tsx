import React, { useState, useCallback } from "react";
import "./App.css";
import { Calculator } from "./Calculator";
import { Agreement } from "./Agreement";

function App() {
  const [page, setPage] = useState<"agreement" | "calculator">("agreement");

  const didAgree = useCallback(() => {
    setPage("calculator");
  }, []);

  return (
    <div className="App">
      {page === "agreement" ? <Agreement onAgree={didAgree} /> : <Calculator />}
    </div>
  );
}

export default App;
