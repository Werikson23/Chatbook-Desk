import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import App from "./App";
import { loadJSON } from "./helpers/loadJSON";
import {
  adaptConfigForLanAccess,
  getLanFallbackConfig
} from "./helpers/lanConfig";
import { i18n } from "./translate/i18n";
import axios from "axios";

let config = loadJSON("/config.json");
if (!config && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
  config = loadJSON("/config-dev.json");
}
if (!config) {
  config = getLanFallbackConfig();
}
config = adaptConfigForLanAccess(config);

if (!config) {
  window.renderError(i18n.t("frontendErrors.ERR_CONFIG_ERROR"));
} else {
  const protocol = config.BACKEND_PROTOCOL || "https";
  const hostname = config.BACKEND_HOST || window.location.hostname;
  const port = config.BACKEND_PORT ? `:${config.BACKEND_PORT}` : "";
  const path = config.BACKEND_PATH || ((hostname === "localhost" || hostname !== window.location.hostname) ? "" : "/backend");

  const backendUrl = `${protocol}://${hostname}${port}${path}/?cb=${Date.now()}`;

  axios.get(backendUrl)
    .then((response) => {
      const serverDate = new Date(response.headers["date"]);
      const clientDate = new Date();
      const diff = Math.abs(serverDate - clientDate);
      const diffMinutes = Math.floor((diff / 1000) / 60);
      if (diffMinutes > 5) {
        let message = i18n.t("frontendErrors.ERR_CLOCK_OUT_OF_SYNC");
        message += `<br><br>Server time: ${serverDate.toLocaleString()}`;
        message += `<br>Client time: ${clientDate.toLocaleString()}`;
        message += `<br>difference: ${diffMinutes} minute(s)`;
        window.renderError(message);
        return;
      }

      ReactDOM.render(
        // <React.StrictMode>
        <CssBaseline>
          <App />
        </CssBaseline>
        // </React.StrictMode>
        ,
        document.getElementById("root"),
        () => {
          window.finishProgress();
        }
      );
    })
    .catch(() => {
      window.renderError(i18n.t("frontendErrors.ERR_BACKEND_UNREACHABLE"));
    });
}
