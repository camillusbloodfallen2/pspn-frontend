import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout/Index";
import { ThemeProvider } from "./theme/ThemeProvider";

// Lazy load pages for better performance - reduces initial bundle size
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Swap = lazy(() => import("./pages/Swap/Swap"));
const UFC = lazy(() => import("./pages/UFC/UFC"));
const UFCBetting = lazy(() => import("./pages/UFCBetting/UFCBetting"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500/30 border-t-sky-500" />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/home" element={<Dashboard />} />
              <Route path="/swap" element={<Swap />} />
              <Route path="/ufc" element={<UFC />} />
              <Route path="/ufc/:id" element={<UFCBetting />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
