import { Box, Chip, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React, { useEffect, useMemo, useState } from "react";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";

export function TagsFilter({ onFiltered, valueIds = [], dense = false }) {
  const [tags, setTags] = useState([]);
  const [selecteds, setSelecteds] = useState([]);

  useEffect(() => {
    async function fetchData() {
      await loadTags();
    }
    fetchData();
  }, []);

  const valueIdsKey = useMemo(
    () =>
      [...(valueIds || []).map((n) => Number(n)).filter((n) => Number.isFinite(n))]
        .sort((a, b) => a - b)
        .join(","),
    [valueIds]
  );

  useEffect(() => {
    if (!tags.length) return;
    const ids = new Set(
      valueIdsKey
        ? valueIdsKey
            .split(",")
            .map((s) => Number(s))
            .filter((n) => Number.isFinite(n))
        : []
    );
    const next = tags.filter((t) => ids.has(Number(t.id)));
    setSelecteds((prev) => {
      if (
        prev.length === next.length &&
        prev.every((p, i) => p.id === next[i].id)
      ) {
        return prev;
      }
      return next;
    });
  }, [valueIdsKey, tags]);

  const loadTags = async () => {
    try {
      const { data } = await api.get(`/tags/list`);
      setTags(data);
    } catch (err) {
      toastError(err);
    }
  };

  const onChange = async (value) => {
    setSelecteds(value);
    if (typeof onFiltered === "function") {
      onFiltered(value);
    }
  };

  return (
    <Box style={{ padding: dense ? 6 : 10 }}>
      <Autocomplete
        multiple
        size="small"
        options={tags}
        value={selecteds}
        onChange={(e, v, r) => onChange(v)}
        getOptionLabel={(option) => option.name}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              variant="outlined"
              style={{
                backgroundColor: option.color || "#eee",
                textShadow: "1px 1px 1px #000",
                color: "white",
              }}
              label={option.name}
              {...getTagProps({ index })}
              size="small"
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            margin={dense ? "dense" : "normal"}
            placeholder={i18n.t("tickets.search.filterByTags")}
          />
        )}
      />
    </Box>
  );
}
