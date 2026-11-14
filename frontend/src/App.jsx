import { useEffect, useState } from "react";
import { checkHealth } from "./services/api";

function App() {
  const [activeTab, setActiveTab] = useState("Reports");
  const [apiStatus, setApiStatus] = useState("Checking...");

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const result = await checkHealth();
        setApiStatus(result.status);
      } catch (error) {
        setApiStatus("Backend unavailable");
      }
    };

    loadHealth();
  }, []);

  const tabs = ["Reports", "Research", "Compare"];

  return (
    <div style={{ padding: "24px", fontFamily: "Arial" }}>
      <h1>GenAI Equity Research Copilot</h1>
      <p>Analyze financial reports using Generative AI.</p>

      <p>
        Backend Status: <strong>{apiStatus}</strong>
      </p>

      <nav style={{ display: "flex", gap: "12px" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            disabled={activeTab === tab}
          >
            {tab}
          </button>
        ))}
      </nav>

      <hr />

      <h2>{activeTab}</h2>
      <p>{activeTab} functionality coming soon.</p>
    </div>
  );
}

export default App;