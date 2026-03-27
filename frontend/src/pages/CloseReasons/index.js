import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField
} from "@material-ui/core";
import { DeleteOutline, Edit } from "@material-ui/icons";
import { toast } from "react-toastify";

import SettingsModuleLayout from "../../components/SettingsModuleLayout";
import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import useSettings from "../../hooks/useSettings";
import { i18nToast } from "../../helpers/i18nToast";

const initialForm = {
  id: null,
  name: "",
  color: "#607D8B",
  queueIds: [],
  isActive: true
};

const CloseReasons = () => {
  const { user } = useContext(AuthContext);
  const { update } = useSettings();
  const canListAll =
    user?.profile === "admin" ||
    user?.profile === "supervisor" ||
    user?.super === true;
  const canEditCompanyPolicy = user?.profile === "admin" || user?.super === true;

  const [loading, setLoading] = useState(false);
  const [reasons, setReasons] = useState([]);
  const [queues, setQueues] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingReason, setDeletingReason] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [requireCloseReason, setRequireCloseReason] = useState(true);

  const loadPolicy = useCallback(async () => {
    if (!canEditCompanyPolicy) return;
    try {
      const { data } = await api.get("/settings/requireCloseReason");
      setRequireCloseReason(data !== "disabled" && data !== "false");
    } catch {
      setRequireCloseReason(true);
    }
  }, [canEditCompanyPolicy]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reasonsRes, queuesRes] = await Promise.all([
        api.get("/close-reasons", { params: canListAll ? { all: "true" } : {} }),
        api.get("/queue")
      ]);
      const reasonsData = reasonsRes.data || [];
      setReasons(reasonsData);
      const qd = queuesRes.data;
      setQueues(Array.isArray(qd) ? qd : qd?.queues || []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadPolicy();
  }, [canListAll, loadPolicy]);

  const handlePolicyChange = async (event) => {
    const checked = event.target.checked;
    setRequireCloseReason(checked);
    try {
      await update({
        key: "requireCloseReason",
        value: checked ? "enabled" : "disabled"
      });
      i18nToast.success("settings.success");
    } catch (err) {
      toastError(err);
      setRequireCloseReason(!checked);
    }
  };

  const handleOpenCreate = () => {
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = reason => {
    setFormData({
      id: reason.id,
      name: reason.name || "",
      color: reason.color || "#607D8B",
      queueIds: reason.queues?.map(queue => queue.id) || [],
      isActive: reason.isActive !== false
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData(initialForm);
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error("Informe o nome do motivo.");
        return;
      }

      const payload = {
        name: formData.name.trim(),
        color: formData.color,
        queueIds: formData.queueIds,
        isActive: formData.isActive
      };

      if (formData.id) {
        await api.put(`/close-reasons/${formData.id}`, payload);
        toast.success("Motivo atualizado com sucesso.");
      } else {
        await api.post("/close-reasons", payload);
        toast.success("Motivo criado com sucesso.");
      }

      handleCloseModal();
      await loadData();
    } catch (err) {
      toastError(err);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/close-reasons/${deletingReason.id}`);
      toast.success("Motivo removido com sucesso.");
      setConfirmOpen(false);
      setDeletingReason(null);
      await loadData();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <SettingsModuleLayout
      embedded
      title="Motivos de encerramento"
      description="Cadastre motivos com cor e opcionalmente restrinja a filas. Quando vazio em filas, o motivo vale para todas. A política abaixo define se o agente deve escolher um motivo ao fechar."
      actions={
        <Button variant="contained" color="primary" onClick={handleOpenCreate}>
          Adicionar motivo
        </Button>
      }
    >
      <ConfirmationModal
        title="Excluir motivo"
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={handleDelete}
      >
        Deseja realmente excluir este motivo?
      </ConfirmationModal>

      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>
          {formData.id ? "Editar motivo de encerramento" : "Adicionar motivo de encerramento"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            label="Nome"
            value={formData.name}
            onChange={event =>
              setFormData(previous => ({ ...previous, name: event.target.value }))
            }
          />
          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            label="Cor"
            value={formData.color}
            onChange={event =>
              setFormData(previous => ({ ...previous, color: event.target.value }))
            }
          />
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel id="close-reason-queues-label">Filas (opcional)</InputLabel>
            <Select
              labelId="close-reason-queues-label"
              multiple
              value={formData.queueIds}
              onChange={event =>
                setFormData(previous => ({ ...previous, queueIds: event.target.value }))
              }
              input={<OutlinedInput label="Filas (opcional)" />}
              renderValue={selected =>
                selected
                  .map(queueId => queues.find(queue => queue.id === queueId)?.name || queueId)
                  .join(", ")
              }
            >
              {queues.map(queue => (
                <MenuItem key={queue.id} value={queue.id}>
                  {queue.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={e => setFormData(p => ({ ...p, isActive: e.target.checked }))}
                color="primary"
              />
            }
            label="Motivo ativo (aparece ao fechar ticket)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {canEditCompanyPolicy ? (
        <Paper
          elevation={0}
          style={{
            padding: 16,
            borderRadius: 12,
            border: "1px solid #e8e8e8",
            boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
            marginBottom: 16
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={requireCloseReason}
                onChange={handlePolicyChange}
                color="primary"
              />
            }
            label="Exigir motivo ao fechar ticket (agentes)"
          />
          <div style={{ fontSize: 13, color: "#86868b", marginTop: 8 }}>
            Desative apenas se quiser permitir fechamento sem seleção de motivo. Fechamentos automáticos do sistema
            continuam respeitando regras internas.
          </div>
        </Paper>
      ) : null}

      <Paper
        elevation={0}
        style={{
          padding: 16,
          overflowY: "auto",
          borderRadius: 12,
          border: "1px solid #e8e8e8",
          boxShadow: "0 8px 24px rgba(0,0,0,0.04)"
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Cor</TableCell>
              <TableCell>Filas</TableCell>
              <TableCell>Ativo</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reasons.map(reason => (
              <TableRow key={reason.id}>
                <TableCell>{reason.id}</TableCell>
                <TableCell>{reason.name}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={reason.color}
                    style={{
                      backgroundColor: reason.color || "#607D8B",
                      color: "#fff"
                    }}
                  />
                </TableCell>
                <TableCell>
                  {(reason.queues || []).length
                    ? reason.queues.map(queue => queue.name).join(", ")
                    : "Todas"}
                </TableCell>
                <TableCell>{reason.isActive === false ? "Não" : "Sim"}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleOpenEdit(reason)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setDeletingReason(reason);
                      setConfirmOpen(true);
                    }}
                  >
                    <DeleteOutline />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!reasons.length && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Nenhum motivo cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </SettingsModuleLayout>
  );
};

export default CloseReasons;
