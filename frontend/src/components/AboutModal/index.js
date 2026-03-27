import React, { useState, useEffect } from "react";


import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Dialog,
  Link,
  Typography,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@material-ui/core";

import { i18n } from "../../translate/i18n";
import useAuth from "../../hooks/useAuth.js";
import { useTheme } from "@material-ui/core/styles";

import { loadJSON } from "../../helpers/loadJSON";
import api from "../../services/api";

const frontendGitInfo = loadJSON('/gitinfo.json');
const logo = "/vector/logo.svg";
const logoDark = "/vector/logo-dark.svg";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
	},
  logoImg: {
    width: "100%",
    margin: "0 auto",
    content: `url("${theme.calculatedLogo()}")`
  },
  ticketzLogoImg: {
    width: "100%",
    margin: "0 auto",
    content: "url(" + (theme.mode === "light" ? logo : logoDark) + ")"
  },
  textCenter: {
    textAlign: "center",
  }

}));

const AboutModal = ({ open, onClose }) => {
	const classes = useStyles();
  const { getCurrentUserInfo } = useAuth();
  const [currentUser, setCurrentUser] = useState({});
  const [backendGitInfo, setBackendGitInfo] = useState(null);
  const theme = useTheme();


	const handleClose = () => {
		onClose();
	};

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const user = await getCurrentUserInfo();
        if (!cancelled) {
          setCurrentUser(user || {});
        }
      } catch {
        if (!cancelled) {
          setCurrentUser({});
        }
      }
      try {
        const response = await api.get("/");
        if (!cancelled) {
          setBackendGitInfo(response.data);
        }
      } catch {
        if (!cancelled) {
          setBackendGitInfo(null);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- dados só ao abrir (evita loop com getCurrentUserInfo)
  }, [open]);

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="sm"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{i18n.t("about.aboutthe")} {currentUser?.super ? "ticketz" : theme.appName }
				</DialogTitle>
				<DialogContent dividers>
				{ currentUser?.super ? 
          <>
            <div>
              <img className={classes.ticketzLogoImg} alt="Ticketz logo" />
            </div>
            <Typography variant="body1" gutterBottom><b>Frontend: 
              { frontendGitInfo.tagName && `Version: ${frontendGitInfo.tagName} Build info: ${frontendGitInfo.buildTimestamp}` }
              { !frontendGitInfo.tagName &&
                <>
                  {frontendGitInfo.commitHash && `Commit: {frontendGitInfo.commitHash} `}
                  {frontendGitInfo.branchName && `Branch: {frontendGitInfo.branchName} `}
                  {frontendGitInfo.commitTimestamp && `Time: {frontendGitInfo.commitTimestamp} `}
                </>
              }
            </b>
            {backendGitInfo &&
            <>
            <br /><b>Backend: 
              { backendGitInfo.tagName && `Version: ${backendGitInfo.tagName} Build info: ${backendGitInfo.buildTimestamp}` }
              { !backendGitInfo.tagName &&
                <>
                  {backendGitInfo.commitHash && `Commit: {backendGitInfo.commitHash} `}
                  {backendGitInfo.branchName && `Branch: {backendGitInfo.branchName} `}
                  {backendGitInfo.commitTimestamp && `Time: {backendGitInfo.commitTimestamp} `}
                </>
              }
            </b>
            </>
            }
            </Typography>
            <Typography variant="body1">{i18n.t("about.aboutdetail")}</Typography>
            <Typography><Link target="_blank" rel="noreferrer noopener" href="https://github.com/Werikson23/Chatbook-Desk">{i18n.t("about.aboutauthorsite")}</Link></Typography>
            <Typography><Link target="_blank" rel="noreferrer noopener" href="https://github.com/Werikson23/Chatbook-Desk">{i18n.t("about.aboutwhaticketsite")}</Link></Typography>
            <Typography><Link target="_blank" rel="noreferrer noopener" href="https://github.com/Werikson23/Chatbook-Desk">{i18n.t("about.aboutvemfazersite")}</Link></Typography>
            <Typography variant="h4">{i18n.t("about.licenseheading")}</Typography>
            <Typography variant="body1">{i18n.t("about.licensedetail")}</Typography>
            <Typography><Link target="_blank" rel="noreferrer noopener" href="https://github.com/Werikson23/Chatbook-Desk/blob/main/LICENSE.md">{i18n.t("about.licensefulltext")}</Link></Typography>
            <Typography><Link target="_blank" rel="noreferrer noopener" href="https://github.com/Werikson23/Chatbook-Desk">{i18n.t("about.licensesourcecode")}</Link></Typography>
          </>
          :
          <>
            <div>
              <img className={classes.logoImg} alt="Application logo" />
            </div>
            <Typography className={classes.textCenter} ><Link target="_blank" rel="noreferrer noopener" href="https://github.com/Werikson23/Chatbook-Desk">{i18n.t("about.copyright")}</Link></Typography>
          </>
        }
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
            type="submit"
            color="primary"
            variant="contained"
					>
						{i18n.t("about.buttonclose")}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default AboutModal;
