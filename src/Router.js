import { Route, Routes } from "react-router-dom";
import React from "react";
import routes from "./routes";
import Assets from "./containers/Assets";

const Router = () => {
  return (
    <div className="content scroll_bar">
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            exact
            element={route.element}
            path={route.path}
          />
        ))}
        <Route exact element={<Assets />} path="*" />
      </Routes>
    </div>
  );
};

export default Router;
