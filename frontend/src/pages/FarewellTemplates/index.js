import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
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
  content: "",
  sortOrder: 0
};

const FarewellTemplates = () => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/farewell-templates");
      setTemplates(data || []);
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

  const handleOpenEdit = template => {
    setFormData({
      id: template.id,
      name: template.name || "",
      content: template.content || "",
      sortOrder: template.sortOrder || 0
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
        toast.error("Informe o nome da mensagem.");
        return;
      }
      if (!formData.content.trim()) {
        toast.error("Informe o conteúdo da mensagem.");
        return;
      }

      const payload = {
        name: formData.name.trim(),
        content: formData.content.trim(),
        sortOrder: Number(formData.sortOrder || 0)
      };

      if (formData.id) {
        await api.put(`/farewell-templates/${formData.id}`, payload);
        toast.success("Mensagem de despedida atualizada.");
      } else {
        await api.post("/farewell-templates", payload);
        toast.success("Mensagem de despedida criada.");
      }

      handleCloseModal();
      await loadData();
    } catch (err) {
      toastError(err);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/farewell-templates/${deletingTemplate.id}`);
      toast.success("Mensagem removida com sucesso.");
      setConfirmOpen(false);
      setDeletingTemplate(null);
      await loadData();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title="Excluir mensagem de despedida"
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={handleDelete}
      >
        Deseja realmente excluir esta mensagem de despedida?
      </ConfirmationModal>

      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>
          {formData.id ? "Editar mensagem de despedida" : "Adicionar mensagem de despedida"}
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
            multiline
            minRows={4}
            label="Mensagem"
            value={formData.content}
            onChange={event =>
              setFormData(previous => ({ ...previous, content: event.target.value }))
            }
          />
          <TextField
            fullWidth
            margin="dense"
            variant="outlined"
            type="number"
            label="Ordem"
            value={formData.sortOrder}
            onChange={event =>
              setFormData(previous => ({ ...previous, sortOrder: event.target.value }))
            }
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

      <MainHeader>
        <Title>Mensagens de Despedida</Title>
        <MainHeaderButtonsWrapper>
          <Button variant="contained" color="primary" onClick={handleOpenCreate}>
            Adicionar mensagem
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper variant="outlined" style={{ padding: 8, overflowY: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Mensagem</TableCell>
              <TableCell>Ordem</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map(template => (
              <TableRow key={template.id}>
                <TableCell>{template.id}</TableCell>
                <TableCell>{template.name}</TableCell>
                <TableCell>{template.content}</TableCell>
                <TableCell>{template.sortOrder}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleOpenEdit(template)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setDeletingTemplate(template);
                      setConfirmOpen(true);
                    }}
                  >
                    <DeleteOutline />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!templates.length && !loading && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Nenhuma mensagem cadastrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default FarewellTemplates;
