import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Grid, MenuItem, Paper, Select, Switch, TextField, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import SettingsModuleLayout from "../../components/SettingsModuleLayout";
import useSettings from "../../hooks/useSettings";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { getBackendURL } from "../../services/config";

const useStyles = makeStyles((theme) => ({
  card: {
    borderRadius: 12,
    border: "1px solid #e8e8e8",
    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
    padding: theme.spacing(2)
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#86868b",
    marginBottom: theme.spacing(1)
  }
}));

const prefix = "backup_";
const defaults = {
  enabled: true,
  incremental: 15,
  fullHours: 24,
  retentionMode: "unlimited"
};

export default function SettingsBackupPage() {
  const classes = useStyles();
  const { getAll, update } = useSettings();
  const [form, setForm] = useState(defaults);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [backups, setBackups] = useState([]);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const rows = await getAll();
      if (!mounted.current) return;
      const byKey = new Map((rows || []).map((r) => [r.key, r.value]));
      setForm({
        enabled: String(byKey.get(`${prefix}enabled`) ?? "true") === "true",
        incremental: Number(byKey.get(`${prefix}incremental_interval_minutes`) || 15),
        fullHours: Number(byKey.get(`${prefix}full_interval_hours`) || 24),
        retentionMode: byKey.get(`${prefix}retention_mode`) || "unlimited"
      });
    } catch (err) {
      if (mounted.current) toastError(err);
    }
  }, [getAll]);

  const loadBackups = useCallback(async () => {
    try {
      const { data } = await api.get("/backup/list");
      if (!mounted.current) return;
      setBackups(data?.backups || []);
    } catch (err) {
      if (mounted.current) toastError(err);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    loadBackups();
  }, [loadSettings, loadBackups]);

  const payload = useMemo(
    () => [
      { key: `${prefix}enabled`, value: String(form.enabled) },
      { key: `${prefix}incremental_interval_minutes`, value: String(form.incremental) },
      { key: `${prefix}full_interval_hours`, value: String(form.fullHours) },
      { key: `${prefix}retention_mode`, value: String(form.retentionMode) }
    ],
    [form]
  );

  const save = async () => {
    setSaving(true);
    try {
      await Promise.all(payload.map((row) => update(row)));
      toast.success("Configurações de backup salvas.");
    } catch (err) {
      toastError(err);
    } finally {
      setSaving(false);
    }
  };

  const runBackup = async (type) => {
    setRunning(true);
    try {
      await api.post("/backup/run", { type });
      if (mounted.current) toast.success("Backup solicitado.");
      await loadBackups();
    } catch (err) {
      if (mounted.current) toastError(err);
    } finally {
      if (mounted.current) setRunning(false);
    }
  };

  const restoreBackup = async (backupId) => {
    try {
      await api.post("/backup/restore", { backupId });
      toast.success("Restauração iniciada.");
    } catch (err) {
      toastError(err);
    }
  };

  const deleteBackup = async (backupId) => {
    try {
      await api.delete(`/backup/${backupId}`);
      toast.success("Backup removido.");
      await loadBackups();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <SettingsModuleLayout
      embedded
      title="Backup"
      description="Backup empresarial com execução manual, histórico e retenção."
      actions={
        <Button color="primary" variant="contained" onClick={save} disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      }
    >
      <Paper className={classes.card} elevation={0}>
        <Typography className={classes.title}>Configurações</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="body2">Backup habilitado</Typography>
              <Switch checked={form.enabled} onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))} />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              type="number"
              fullWidth
              label="Incremental (min)"
              value={form.incremental}
              onChange={(e) => setForm((f) => ({ ...f, incremental: Number(e.target.value) || 15 }))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              type="number"
              fullWidth
              label="Full (horas)"
              value={form.fullHours}
              onChange={(e) => setForm((f) => ({ ...f, fullHours: Number(e.target.value) || 24 }))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="textSecondary">Retenção</Typography>
            <Select fullWidth value={form.retentionMode} onChange={(e) => setForm((f) => ({ ...f, retentionMode: e.target.value }))}>
              <MenuItem value="unlimited">Ilimitada</MenuItem>
              <MenuItem value="standard">Padrão</MenuItem>
            </Select>
          </Grid>
        </Grid>
      </Paper>

      <Paper className={classes.card} elevation={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography className={classes.title}>Execução e histórico</Typography>
          <Box display="flex" style={{ gap: 8 }}>
            <Button size="small" variant="outlined" color="primary" disabled={running} onClick={() => runBackup("incremental")}>
              Incremental
            </Button>
            <Button size="small" variant="contained" color="primary" disabled={running} onClick={() => runBackup("full")}>
              Full
            </Button>
          </Box>
        </Box>
        {(backups || []).map((b) => (
          <Box key={b.id} display="flex" justifyContent="space-between" alignItems="center" style={{ border: "1px solid #e8e8e8", borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>
            <div>
              <Typography variant="body2" style={{ fontWeight: 600 }}>
                #{b.id} · {b.type} · {b.status}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {b.createdAt ? new Date(b.createdAt).toLocaleString() : "—"}
              </Typography>
            </div>
            <Box display="flex" style={{ gap: 8 }}>
              <Button size="small" onClick={() => window.open(`${getBackendURL()}/backup/download/${b.id}`, "_blank")} disabled={!b.filePath}>
                Download
              </Button>
              <Button size="small" color="primary" variant="outlined" onClick={() => restoreBackup(b.id)}>
                Restore
              </Button>
              <Button size="small" color="secondary" onClick={() => deleteBackup(b.id)}>
                Excluir
              </Button>
            </Box>
          </Box>
        ))}
      </Paper>
    </SettingsModuleLayout>
  );
}

