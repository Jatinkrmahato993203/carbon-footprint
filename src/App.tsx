import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./Landing";
import { AppFlow } from "./AppFlow";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppFlow />} />
      </Routes>
    </BrowserRouter>
  );
}
