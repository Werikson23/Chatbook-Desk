import React, { useContext } from "react";
import { Redirect, Route as RouterRoute } from "react-router-dom";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";

const SuperRoute = ({ component: Component, ...rest }) => {
  const { isAuth, loading, user } = useContext(AuthContext);

  if (!isAuth) {
    return (
      <>
        {loading && <BackdropLoading />}
        <Redirect to={{ pathname: "/login", state: { from: rest.location } }} />
      </>
    );
  }

  if (!user?.super) {
    return <Redirect to={{ pathname: "/settings" }} />;
  }

  return (
    <>
      {loading && <BackdropLoading />}
      <RouterRoute {...rest} component={Component} />
    </>
  );
};

export default SuperRoute;
