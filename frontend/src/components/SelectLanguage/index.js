import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import { messages } from "../../translate/languages";

const languageOptions = {};

Object.keys(messages).forEach((key) => {
  languageOptions[key] = messages[key].translations.mainDrawer.appBar.i18n.language;
});

const normalizeLanguageValue = (rawValue) => {
  if (rawValue === null || rawValue === undefined) {
    return "";
  }

  const value = String(rawValue).trim();
  if (!value) {
    return "";
  }

  if (languageOptions[value]) {
    return value;
  }

  const underscored = value.replace("-", "_");
  if (languageOptions[underscored]) {
    return underscored;
  }

  const lower = value.toLowerCase();
  if (lower === "pt-br" || lower === "pt_br") {
    return "pt";
  }
  if (lower === "pt-pt" || lower === "pt_pt") {
    return "pt_PT";
  }

  return "";
};

export function SelectLanguage({ className, label, value, name, onChange, field, form, variant, margin, fullWidth }) {
  const handleChange = (event) => {
    const nextValue = normalizeLanguageValue(event.target.value);
    if (form && field) {
      form.setFieldValue(field.name, nextValue);
    } else if (onChange) {
      onChange({
        ...event,
        target: {
          ...event.target,
          value: nextValue
        }
      });
    }
  };

  const selectedValue = normalizeLanguageValue(field?.value ?? value);
  
  label = label || i18n.t("common.language");

  return (
    <FormControl className={className} variant={variant} margin={margin} fullWidth={fullWidth}>
      <InputLabel id="language-label">
        {label}
      </InputLabel>
      <Select
        labelId="language-label"
        label={label}
        id="language"
        name={field?.name || name || "language"}
        value={selectedValue}
        onChange={handleChange}
        variant={variant}
        margin={margin}
      >
        {Object.entries(languageOptions).map(([key, display]) => (
          <MenuItem key={key} value={key}>
            {display}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
