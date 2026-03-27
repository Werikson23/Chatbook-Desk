import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Redirect } from "react-router-dom";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  IconButton
} from "@material-ui/core";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import AddIcon from "@material-ui/icons/Add";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import SettingsModuleLayout from "../../components/SettingsModuleLayout";
import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

const DATA_TYPES = [
  { value: "text", label: "Texto" },
  { value: "textarea", label: "Texto longo" },
  { value: "number", label: "Número" },
  { value: "boolean", label: "Sim/Não" },
  { value: "date", label: "Data" },
  { value: "datetime", label: "Data e hora" },
  { value: "location", label: "Localização" },
  { value: "media", label: "Mídia" },
  { value: "file", label: "Arquivo" }
];

const PROFILE_ORDER = ["user", "supervisor", "admin"];
const PROFILE_LABELS = {
  user: "Agente",
  supervisor: "Supervisor",
  admin: "Administrador"
};

const defaultPermissionRows = () =>
  PROFILE_ORDER.map((profile) => ({
    profile,
    canView: true,
    canEdit: profile !== "user",
    canCopy: profile !== "user"
  }));

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    borderRadius: 12,
    border: "1px solid #e8e8e8",
    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
    ...theme.scrollbarStyles
  },
  listItem: {
    padding: theme.spacing(1.5, 2),
    borderRadius: 8,
    cursor: "pointer",
    border: "1px solid transparent",
    marginBottom: 6,
    transition: "background 0.15s, border-color 0.15s"
  },
  listItemActive: {
    background: "rgba(28,100,242,0.08)",
    borderColor: "#1c64f2"
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#86868b",
    marginBottom: theme.spacing(1)
  },
  auditRow: {
    fontSize: 13
  }
}));

const emptyContainerForm = (entityType) => ({
  name: "",
  key: "",
  entityType,
  category: "",
  icon: "",
  color: "#607D8B",
  uiLayout: "tabs",
  isRepeatable: false,
  isCollapsible: true,
  sortOrder: 0
});

const emptyDefinitionForm = () => ({
  name: "",
  key: "",
  dataType: "text",
  isRequired: false,
  isSearchable: false,
  isRepeatable: false,
  sortOrder: 0,
  visibility: "all"
});

function mergePermissions(rows) {
  const byProfile = new Map((rows || []).map((r) => [r.profile, r]));
  return PROFILE_ORDER.map((profile) => {
    const existing = byProfile.get(profile);
    if (existing) {
      return {
        profile,
        canView: Boolean(existing.canView),
        canEdit: Boolean(existing.canEdit),
        canCopy: Boolean(existing.canCopy)
      };
    }
    const def = defaultPermissionRows().find((d) => d.profile === profile);
    return def;
  });
}

export default function SettingsAttributesPage() {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const canManage = user?.profile === "admin" || user?.super === true;

  const [mainTab, setMainTab] = useState(0);
  const [entityType, setEntityType] = useState("contact");
  const [containers, setContainers] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [permRows, setPermRows] = useState(() => defaultPermissionRows());

  const [containerDialogOpen, setContainerDialogOpen] = useState(false);
  const [containerForm, setContainerForm] = useState(() => emptyContainerForm("contact"));
  const [editingContainerId, setEditingContainerId] = useState(null);

  const [defDialogOpen, setDefDialogOpen] = useState(false);
  const [defForm, setDefForm] = useState(emptyDefinitionForm);

  const [confirmDefDelete, setConfirmDefDelete] = useState(null);

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditHasMore, setAuditHasMore] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);

  const loadContainers = useCallback(async () => {
    setLoadingList(true);
    try {
      const { data } = await api.get("/attribute-containers", {
        params: { entityType }
      });
      setContainers(Array.isArray(data) ? data : []);
    } catch (e) {
      toastError(e);
      setContainers([]);
    } finally {
      setLoadingList(false);
    }
  }, [entityType]);

  const loadDetail = useCallback(async (containerId) => {
    if (!containerId) {
      setDetail(null);
      setPermRows(defaultPermissionRows());
      return;
    }
    setLoadingDetail(true);
    try {
      const { data } = await api.get(`/attribute-containers/${containerId}/detail`);
      setDetail(data);
      setPermRows(mergePermissions(data.permissions));
    } catch (e) {
      toastError(e);
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (!canManage) return;
    loadContainers();
  }, [canManage, loadContainers]);

  useEffect(() => {
    setSelectedId(null);
    setDetail(null);
  }, [entityType]);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  const handleOpenNewContainer = () => {
    setEditingContainerId(null);
    setContainerForm(emptyContainerForm(entityType));
    setContainerDialogOpen(true);
  };

  const handleOpenEditContainer = () => {
    if (!detail?.container) return;
    const c = detail.container;
    setEditingContainerId(c.id);
    setContainerForm({
      name: c.name,
      key: c.key,
      entityType: c.entityType,
      category: c.category || "",
      icon: c.icon || "",
      color: c.color || "#607D8B",
      uiLayout: c.uiLayout || "tabs",
      isRepeatable: Boolean(c.isRepeatable),
      isCollapsible: c.isCollapsible !== false,
      sortOrder: c.sortOrder ?? 0
    });
    setContainerDialogOpen(true);
  };

  const saveContainer = async () => {
    const body = {
      name: containerForm.name.trim(),
      key: containerForm.key.trim().replace(/\s+/g, "_"),
      entityType: containerForm.entityType,
      category: containerForm.category || null,
      icon: containerForm.icon || null,
      color: containerForm.color || null,
      uiLayout: containerForm.uiLayout || "tabs",
      isRepeatable: Boolean(containerForm.isRepeatable),
      isCollapsible: containerForm.isCollapsible !== false,
      sortOrder: Number(containerForm.sortOrder) || 0
    };
    if (!body.name || !body.key) {
      toast.error("Nome e chave são obrigatórios.");
      return;
    }
    try {
      let createdId = null;
      if (editingContainerId) {
        await api.put(`/attribute-containers/${editingContainerId}`, body);
        toast.success("Conjunto atualizado.");
      } else {
        const { data } = await api.post("/attribute-containers", body);
        toast.success("Conjunto criado.");
        createdId = data.id;
        setSelectedId(data.id);
      }
      setContainerDialogOpen(false);
      await loadContainers();
      if (editingContainerId) await loadDetail(editingContainerId);
      else if (createdId) await loadDetail(createdId);
    } catch (e) {
      toastError(e);
    }
  };

  const savePermissions = async () => {
    if (!selectedId) return;
    try {
      await api.put(`/attribute-containers/${selectedId}/permissions`, {
        rows: permRows
      });
      toast.success("Permissões salvas.");
      await loadDetail(selectedId);
    } catch (e) {
      toastError(e);
    }
  };

  const openNewDef = () => {
    setDefForm(emptyDefinitionForm());
    setDefDialogOpen(true);
  };

  const saveDefinition = async () => {
    if (!selectedId) return;
    const body = {
      containerId: selectedId,
      name: defForm.name.trim(),
      key: defForm.key.trim().replace(/\s+/g, "_"),
      dataType: defForm.dataType,
      isRequired: Boolean(defForm.isRequired),
      isSearchable: Boolean(defForm.isSearchable),
      isRepeatable: Boolean(defForm.isRepeatable),
      sortOrder: Number(defForm.sortOrder) || 0,
      visibility: defForm.visibility || "all"
    };
    if (!body.name || !body.key) {
      toast.error("Nome e chave do campo são obrigatórios.");
      return;
    }
    try {
      await api.post("/attribute-definitions", body);
      toast.success("Campo adicionado.");
      setDefDialogOpen(false);
      await loadDetail(selectedId);
    } catch (e) {
      toastError(e);
    }
  };

  const deleteDefinition = async () => {
    if (!confirmDefDelete) return;
    try {
      await api.delete(`/attribute-definitions/${confirmDefDelete.id}`);
      toast.success("Campo removido.");
      setConfirmDefDelete(null);
      await loadDetail(selectedId);
    } catch (e) {
      toastError(e);
    }
  };

  const loadAudit = useCallback(async (page = 1) => {
    setAuditLoading(true);
    try {
      const { data } = await api.get("/attribute-audit-logs", {
        params: { pageNumber: String(page) }
      });
      const logs = data.logs || [];
      if (page === 1) setAuditLogs(logs);
      else setAuditLogs((prev) => [...prev, ...logs]);
      setAuditHasMore(Boolean(data.hasMore));
      setAuditPage(page);
    } catch (e) {
      toastError(e);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canManage || mainTab !== 1) return;
    loadAudit(1);
  }, [canManage, mainTab, loadAudit]);

  const mergedPermRows = useMemo(() => mergePermissions(permRows), [permRows]);

  if (!canManage) {
    return <Redirect to="/settings" />;
  }

  return (
    <SettingsModuleLayout
      embedded
      title="Atributos customizados"
      description="Defina conjuntos de campos para contatos e tickets, permissões por perfil e auditoria de alterações — no estilo Chatwoot."
      actions={
        mainTab === 0 ? (
          <Box display="flex" alignItems="center" flexWrap="wrap" style={{ gap: 8 }}>
            <ToggleButtonGroup
              size="small"
              value={entityType}
              exclusive
              onChange={(_, v) => v && setEntityType(v)}
            >
              <ToggleButton value="contact">Contato</ToggleButton>
              <ToggleButton value="ticket">Ticket</ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenNewContainer}
            >
              Novo conjunto
            </Button>
          </Box>
        ) : null
      }
    >
      <Paper elevation={0} className={classes.mainPaper}>
        <Tabs
          value={mainTab}
          onChange={(_, v) => setMainTab(v)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Conjuntos e campos" />
          <Tab label="Auditoria" />
        </Tabs>

        {mainTab === 0 && (
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography className={classes.sectionTitle}>Conjuntos</Typography>
                {loadingList ? (
                  <Typography color="textSecondary">Carregando…</Typography>
                ) : containers.length === 0 ? (
                  <Typography color="textSecondary" variant="body2">
                    Nenhum conjunto para este tipo. Crie um para começar.
                  </Typography>
                ) : (
                  containers.map((c) => (
                    <div
                      key={c.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedId(c.id)}
                      onKeyDown={(e) => e.key === "Enter" && setSelectedId(c.id)}
                      className={`${classes.listItem} ${
                        selectedId === c.id ? classes.listItemActive : ""
                      }`}
                    >
                      <Typography style={{ fontWeight: 600 }}>{c.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {c.key}
                      </Typography>
                    </div>
                  ))
                )}
              </Grid>
              <Grid item xs={12} md={8}>
                {!selectedId ? (
                  <Typography color="textSecondary">
                    Selecione um conjunto à esquerda ou crie um novo.
                  </Typography>
                ) : loadingDetail ? (
                  <Typography color="textSecondary">Carregando detalhes…</Typography>
                ) : detail?.container ? (
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <div>
                        <Typography variant="h6" style={{ fontWeight: 700 }}>
                          {detail.container.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Chave: {detail.container.key} · Ordem: {detail.container.sortOrder}
                        </Typography>
                      </div>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={handleOpenEditContainer}
                      >
                        Editar conjunto
                      </Button>
                    </Box>

                    <Typography className={classes.sectionTitle}>Campos</Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Nome</TableCell>
                          <TableCell>Chave</TableCell>
                          <TableCell>Tipo</TableCell>
                          <TableCell align="right">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(detail.definitions || []).map((d) => (
                          <TableRow key={d.id}>
                            <TableCell>{d.name}</TableCell>
                            <TableCell>{d.key}</TableCell>
                            <TableCell>{d.dataType}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => setConfirmDefDelete(d)}
                                aria-label="Excluir campo"
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Box mt={1}>
                      <Button size="small" color="primary" startIcon={<AddIcon />} onClick={openNewDef}>
                        Adicionar campo
                      </Button>
                    </Box>

                    <Box mt={3}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography className={classes.sectionTitle}>
                          Permissões por perfil
                        </Typography>
                        <Button size="small" variant="outlined" color="primary" onClick={savePermissions}>
                          Salvar permissões
                        </Button>
                      </Box>
                      <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                        Administradores e supervisores têm acesso total na aplicação; as linhas abaixo
                        aplicam-se principalmente ao perfil Agente.
                      </Typography>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Perfil</TableCell>
                            <TableCell align="center">Ver</TableCell>
                            <TableCell align="center">Editar</TableCell>
                            <TableCell align="center">Copiar</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {mergedPermRows.map((row) => (
                            <TableRow key={row.profile}>
                              <TableCell>{PROFILE_LABELS[row.profile] || row.profile}</TableCell>
                              <TableCell align="center">
                                <Switch
                                  size="small"
                                  checked={row.canView}
                                  onChange={(e) => {
                                    const v = e.target.checked;
                                    setPermRows((prev) =>
                                      prev.map((p) =>
                                        p.profile === row.profile ? { ...p, canView: v } : p
                                      )
                                    );
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Switch
                                  size="small"
                                  checked={row.canEdit}
                                  onChange={(e) => {
                                    const v = e.target.checked;
                                    setPermRows((prev) =>
                                      prev.map((p) =>
                                        p.profile === row.profile ? { ...p, canEdit: v } : p
                                      )
                                    );
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Switch
                                  size="small"
                                  checked={row.canCopy}
                                  onChange={(e) => {
                                    const v = e.target.checked;
                                    setPermRows((prev) =>
                                      prev.map((p) =>
                                        p.profile === row.profile ? { ...p, canCopy: v } : p
                                      )
                                    );
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </Box>
                ) : null}
              </Grid>
            </Grid>
          </Box>
        )}

        {mainTab === 1 && (
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary" paragraph>
              Últimas alterações em atributos customizados (até 50 por página).
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Ação</TableCell>
                  <TableCell>Entidade</TableCell>
                  <TableCell>Campo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className={classes.auditRow}>
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>
                      {log.entityType} #{log.entityId}
                    </TableCell>
                    <TableCell>{log.fieldName || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {auditLoading && auditLogs.length === 0 ? (
              <Typography color="textSecondary">Carregando…</Typography>
            ) : null}
            {auditHasMore ? (
              <Box mt={2}>
                <Button
                  size="small"
                  disabled={auditLoading}
                  onClick={() => loadAudit(auditPage + 1)}
                >
                  Carregar mais
                </Button>
              </Box>
            ) : null}
          </Box>
        )}
      </Paper>

      <Dialog
        open={containerDialogOpen}
        onClose={() => setContainerDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingContainerId ? "Editar conjunto" : "Novo conjunto"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nome"
            fullWidth
            value={containerForm.name}
            onChange={(e) => setContainerForm((f) => ({ ...f, name: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Chave (slug)"
            fullWidth
            helperText="ex.: dados_empresa — sem espaços"
            value={containerForm.key}
            onChange={(e) => setContainerForm((f) => ({ ...f, key: e.target.value }))}
          />
          <FormControl margin="dense" fullWidth>
            <InputLabel>Tipo de entidade</InputLabel>
            <Select
              value={containerForm.entityType}
              onChange={(e) => setContainerForm((f) => ({ ...f, entityType: e.target.value }))}
            >
              <MenuItem value="contact">Contato</MenuItem>
              <MenuItem value="ticket">Ticket</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Categoria (opcional)"
            fullWidth
            value={containerForm.category}
            onChange={(e) => setContainerForm((f) => ({ ...f, category: e.target.value }))}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Cor"
                fullWidth
                value={containerForm.color}
                onChange={(e) => setContainerForm((f) => ({ ...f, color: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Ordem"
                type="number"
                fullWidth
                value={containerForm.sortOrder}
                onChange={(e) => setContainerForm((f) => ({ ...f, sortOrder: e.target.value }))}
              />
            </Grid>
          </Grid>
          <FormControl margin="dense" fullWidth>
            <InputLabel>Layout</InputLabel>
            <Select
              value={containerForm.uiLayout}
              onChange={(e) => setContainerForm((f) => ({ ...f, uiLayout: e.target.value }))}
            >
              <MenuItem value="tabs">Abas</MenuItem>
              <MenuItem value="accordion">Acordeão</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={containerForm.isRepeatable}
                onChange={(e) =>
                  setContainerForm((f) => ({ ...f, isRepeatable: e.target.checked }))
                }
              />
            }
            label="Permitir várias instâncias (grupos repetíveis)"
          />
          <FormControlLabel
            control={
              <Switch
                checked={containerForm.isCollapsible}
                onChange={(e) =>
                  setContainerForm((f) => ({ ...f, isCollapsible: e.target.checked }))
                }
              />
            }
            label="Permitir recolher"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContainerDialogOpen(false)}>Cancelar</Button>
          <Button color="primary" variant="contained" onClick={saveContainer}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={defDialogOpen} onClose={() => setDefDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo campo</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nome"
            fullWidth
            value={defForm.name}
            onChange={(e) => setDefForm((f) => ({ ...f, name: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Chave"
            fullWidth
            value={defForm.key}
            onChange={(e) => setDefForm((f) => ({ ...f, key: e.target.value }))}
          />
          <FormControl margin="dense" fullWidth>
            <InputLabel>Tipo de dado</InputLabel>
            <Select
              value={defForm.dataType}
              onChange={(e) => setDefForm((f) => ({ ...f, dataType: e.target.value }))}
            >
              {DATA_TYPES.map((dt) => (
                <MenuItem key={dt.value} value={dt.value}>
                  {dt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Ordem"
            type="number"
            fullWidth
            value={defForm.sortOrder}
            onChange={(e) => setDefForm((f) => ({ ...f, sortOrder: e.target.value }))}
          />
          <FormControlLabel
            control={
              <Switch
                checked={defForm.isRequired}
                onChange={(e) => setDefForm((f) => ({ ...f, isRequired: e.target.checked }))}
              />
            }
            label="Obrigatório"
          />
          <FormControlLabel
            control={
              <Switch
                checked={defForm.isSearchable}
                onChange={(e) => setDefForm((f) => ({ ...f, isSearchable: e.target.checked }))}
              />
            }
            label="Pesquisável"
          />
          <FormControlLabel
            control={
              <Switch
                checked={defForm.isRepeatable}
                onChange={(e) => setDefForm((f) => ({ ...f, isRepeatable: e.target.checked }))}
              />
            }
            label="Campo repetível"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDefDialogOpen(false)}>Cancelar</Button>
          <Button color="primary" variant="contained" onClick={saveDefinition}>
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationModal
        title="Excluir campo"
        open={Boolean(confirmDefDelete)}
        onClose={() => setConfirmDefDelete(null)}
        onConfirm={deleteDefinition}
      >
        {confirmDefDelete
          ? `Remover o campo "${confirmDefDelete.name}"? Valores salvos serão apagados.`
          : null}
      </ConfirmationModal>
    </SettingsModuleLayout>
  );
}
