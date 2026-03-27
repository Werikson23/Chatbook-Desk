import React from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    fontWeight: 600,
    fontSize: "1rem",
    letterSpacing: "-0.01em",
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1.5),
  },
}));

const Title = props => {
	const classes = useStyles();
	return (
		<Typography component="h2" variant="h6" className={classes.root} gutterBottom={false}>
			{props.children}
		</Typography>
	);
};

export default Title;
