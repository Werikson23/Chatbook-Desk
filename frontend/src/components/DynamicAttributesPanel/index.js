import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Checkbox,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import FileCopyOutlinedIcon from "@material-ui/icons/FileCopyOutlined";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { getBackendURL } from "../../services/config";

const useStyles = makeStyles((theme) => ({
  root: { width: "100%" },
  containerTabs: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  tab: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #2b2e33",
    background: "#1c1e21",
    color: "#e8e8ec",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  tabActive: {
    borderColor: "#1c64f2",
    background: "rgba(28,100,242,0.15)",
    color: "#fff",
  },
  instanceRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  field: { marginBottom: 10 },
  empty: { color: "#9ca3af", fontSize: 13 },
  actions: { display: "flex", gap: 4 },
}));

const debounce = (fn, ms) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

const normalizeLocation = (v) => {
  if (!v || typeof v !== "object") return { lat: "", lng: "", address: "", city: "" };
  return {
    lat: v.lat ?? "",
    lng: v.lng ?? "",
    address: v.address ?? "",
    city: v.city ?? "",
  };
};

const FieldEditor = ({ def, value, disabled, onChange, chatwoot }) => {
  const dt = def.dataType;
  if (dt === "boolean") {
    return (
      <Checkbox
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        color="primary"
      />
    );
  }
  if (dt === "number") {
    return (
      <TextField
        fullWidth
        size="small"
        type="number"
        variant="outlined"
        value={value === null || value === undefined ? "" : value}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        disabled={disabled}
      />
    );
  }
  if (dt === "date") {
    return (
      <TextField
        fullWidth
        size="small"
        type="date"
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        value={value ? String(value).slice(0, 10) : ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled}
      />
    );
  }
  if (dt === "datetime") {
    return (
      <TextField
        fullWidth
        size="small"
        type="datetime-local"
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        value={value ? String(value).slice(0, 16) : ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled}
      />
    );
  }
  if (dt === "location") {
    const loc = normalizeLocation(value);
    const setPart = (k, v2) => onChange({ ...loc, [k]: v2 });
    return (
      <div>
        <TextField
          className="field"
          fullWidth
          size="small"
          label="Latitude"
          variant="outlined"
          value={loc.lat}
          onChange={(e) => setPart("lat", e.target.value)}
          disabled={disabled}
          style={{ marginBottom: 8 }}
        />
        <TextField
          fullWidth
          size="small"
          label="Longitude"
          variant="outlined"
          value={loc.lng}
          onChange={(e) => setPart("lng", e.target.value)}
          disabled={disabled}
          style={{ marginBottom: 8 }}
        />
        <TextField
          fullWidth
          size="small"
          label="Endereço"
          variant="outlined"
          value={loc.address}
          onChange={(e) => setPart("address", e.target.value)}
          disabled={disabled}
          style={{ marginBottom: 8 }}
        />
        <TextField
          fullWidth
          size="small"
          label="Cidade"
          variant="outlined"
          value={loc.city}
          onChange={(e) => setPart("city", e.target.value)}
          disabled={disabled}
        />
      </div>
    );
  }
  if (dt === "media" || dt === "file") {
    const url =
      value && typeof value === "object"
        ? value.url || value.thumbnail_url || ""
        : "";
    return (
      <div>
        <TextField
          fullWidth
          size="small"
          label="URL"
          variant="outlined"
          value={url}
          onChange={(e) =>
            onChange({
              ...(typeof value === "object" && value ? value : {}),
              url: e.target.value,
              type: dt === "media" ? "image" : "file",
            })
          }
          disabled={disabled}
        />
        {dt === "media" && url ? (
          <img
            src={url.startsWith("http") ? url : `${getBackendURL()}${url}`}
            alt=""
            style={{ maxWidth: "100%", marginTop: 8, borderRadius: 6 }}
          />
        ) : null}
      </div>
    );
  }
  if (dt === "textarea") {
    return (
      <TextField
        fullWidth
        multiline
        minRows={3}
        variant="outlined"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    );
  }
  return (
    <TextField
      fullWidth
      size="small"
      variant="outlined"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
  );
};

const DynamicAttributesPanel = ({ entityType, entityId, chatwoot = true, title }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [schema, setSchema] = useState({ containers: [] });
  const [activeContainerIdx, setActiveContainerIdx] = useState(0);
  const [editMode, setEditMode] = useState(true);
  const pendingRef = useRef([]);

  const load = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/entities/${entityType}/${entityId}/attributes/schema`);
      setSchema(data || { containers: [] });
    } catch (e) {
      toastError(e);
      setSchema({ containers: [] });
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    load();
  }, [load]);

  const flushSave = useCallback(async () => {
    const batch = pendingRef.current.splice(0, pendingRef.current.length);
    if (!batch.length) return;
    const map = new Map();
    batch.forEach((r) => {
      const k = `${r.attributeDefinitionId}-${r.groupInstanceId ?? "null"}`;
      map.set(k, r);
    });
    const values = [...map.values()];
    try {
      await api.put(`/entities/${entityType}/${entityId}/attributes`, { values });
    } catch (e) {
      toastError(e);
    }
  }, [entityType, entityId]);

  const debouncedFlush = useMemo(() => debounce(() => flushSave(), 600), [flushSave]);

  const queueSave = useCallback(
    (row) => {
      pendingRef.current.push(row);
      debouncedFlush();
    },
    [debouncedFlush]
  );

  const onFieldChange = (def, groupInstanceId, newVal) => {
    const c = schema.containers[activeContainerIdx];
    if (!c?.permissions?.canEdit) return;
    queueSave({
      attributeDefinitionId: def.id,
      groupInstanceId: groupInstanceId ?? null,
      value: newVal,
    });
    setSchema((prev) => {
      const next = { ...prev, containers: prev.containers.map((cont, ci) => {
        if (ci !== activeContainerIdx) return cont;
        return {
          ...cont,
          instances: cont.instances.map((inst) => {
            const match =
              (inst.id == null && groupInstanceId == null) ||
              inst.id === groupInstanceId;
            if (!match) return inst;
            return {
              ...inst,
              attributes: inst.attributes.map((a) =>
                a.id === def.id ? { ...a, value: newVal } : a
              ),
            };
          }),
        };
      }) };
      return next;
    });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado.");
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };

  const handleCopy = async (groupInstanceId) => {
    try {
      await api.post(`/attribute-group-instances/${groupInstanceId}/copy`, {});
      toast.success("Conjunto copiado.");
      await load();
    } catch (e) {
      toastError(e);
    }
  };

  const containers = schema.containers || [];

  if (loading) {
    return (
      <div className={classes.root} style={{ textAlign: "center", padding: 16 }}>
        <CircularProgress size={22} />
      </div>
    );
  }

  if (!containers.length) {
    return (
      <Typography className={classes.empty}>
        {title ? `${title}: ` : ""}
        Nenhum conjunto de atributos configurado.
      </Typography>
    );
  }

  const active = containers[activeContainerIdx] || containers[0];
  const canEdit = active?.permissions?.canEdit && editMode;
  const canCopy = active?.permissions?.canCopy;

  return (
    <div className={classes.root}>
      {title ? (
        <Typography variant="caption" style={{ color: "#9ca3af", display: "block", marginBottom: 8 }}>
          {title}
        </Typography>
      ) : null}
      <div className={classes.containerTabs}>
        {containers.map((c, idx) => (
          <button
            key={c.id}
            type="button"
            className={`${classes.tab} ${idx === activeContainerIdx ? classes.tabActive : ""}`}
            onClick={() => setActiveContainerIdx(idx)}
          >
            {c.icon ? `${c.icon} ` : ""}
            {c.name}
          </button>
        ))}
      </div>

      <div className={classes.instanceRow}>
        <Typography variant="caption" style={{ color: "#9ca3af" }}>
          {active?.name}
        </Typography>
        <div className={classes.actions}>
          <Tooltip title={editMode ? "Modo edição" : "Somente leitura"}>
            <span>
              <IconButton
                size="small"
                onClick={() => setEditMode((v) => !v)}
                style={{ color: "#9ca3af" }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </div>
      </div>

      {(active.instances || []).map((inst) => (
        <div key={inst.id ?? "single"} style={{ marginBottom: 16 }}>
          <div className={classes.instanceRow}>
            <Typography variant="subtitle2" style={{ color: "#e8e8ec" }}>
              {inst.label}
            </Typography>
            {active.isRepeatable && inst.id && canCopy ? (
              <Tooltip title="Copiar conjunto">
                <IconButton size="small" onClick={() => handleCopy(inst.id)} style={{ color: "#9ca3af" }}>
                  <FileCopyOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
          </div>
          {(inst.attributes || []).map((def) => (
            <div key={def.id} className={classes.field}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <Typography variant="caption" style={{ color: "#9ca3af" }}>
                  {def.name}
                  {def.isRequired ? " *" : ""}
                </Typography>
                <Tooltip title="Copiar valor">
                  <IconButton
                    size="small"
                    onClick={() =>
                      copyToClipboard(
                        typeof def.value === "object"
                          ? JSON.stringify(def.value ?? {})
                          : String(def.value ?? "")
                      )
                    }
                    style={{ color: "#9ca3af", padding: 4 }}
                  >
                    <FileCopyOutlinedIcon style={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </div>
              <FieldEditor
                def={def}
                value={def.value}
                disabled={!canEdit}
                chatwoot={chatwoot}
                onChange={(v) => {
                  let out = v;
                  if (def.dataType === "location") {
                    const n = normalizeLocation(v);
                    out = {
                      lat: n.lat === "" ? null : Number(n.lat),
                      lng: n.lng === "" ? null : Number(n.lng),
                      address: n.address || "",
                      city: n.city || "",
                    };
                  }
                  onFieldChange(def, inst.id, out);
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default DynamicAttributesPanel;
