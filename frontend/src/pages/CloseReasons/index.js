import React, { useEffect, useState } from "react";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField
} from "@material-ui/core";
import { DeleteOutline, Edit } from "@material-ui/icons";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const initialForm = {
  id: null,
  name: "",
  color: "#607D8B",
  queueIds: []
};

const CloseReasons = () => {
  const [loading, setLoading] = useState(false);
  const [reasons, setReasons] = useState([]);
  const [queues, setQueues] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingReason, setDeletingReason] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const [{ data: reasonsData }, { data: queuesData }] = await Promise.all([
        api.get("/close-reasons"),
        api.get("/queue")
      ]);
      setReasons(reasonsData || []);
      setQueues(queuesData?.queues || []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = reason => {
    setFormData({
      id: reason.id,
      name: reason.name || "",
      color: reason.color || "#607D8B",
      queueIds: reason.queues?.map(queue => queue.id) || []
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
        queueIds: formData.queueIds
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
    <MainContainer>
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

      <MainHeader>
        <Title>Motivos de Encerramento</Title>
        <MainHeaderButtonsWrapper>
          <Button variant="contained" color="primary" onClick={handleOpenCreate}>
            Adicionar motivo
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper variant="outlined" style={{ padding: 8, overflowY: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Cor</TableCell>
              <TableCell>Filas</TableCell>
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
                <TableCell colSpan={5} align="center">
                  Nenhum motivo cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default CloseReasons;
