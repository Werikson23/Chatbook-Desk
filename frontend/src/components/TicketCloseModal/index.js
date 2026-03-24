import React, { useEffect, useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const TicketCloseModal = ({ open, onClose, onConfirm, ticket, loading }) => {
  const [closeReasons, setCloseReasons] = useState([]);
  const [farewellTemplates, setFarewellTemplates] = useState([]);
  const [selectedReasonId, setSelectedReasonId] = useState("");
  const [selectedFarewellTemplateId, setSelectedFarewellTemplateId] = useState("");
  const [hasValidationError, setHasValidationError] = useState(false);

  useEffect(() => {
    if (!open || !ticket?.id) {
      return;
    }

    const loadData = async () => {
      try {
        const [{ data: reasons }, { data: templates }] = await Promise.all([
          api.get("/close-reasons", {
            params: { queueId: ticket.queueId || undefined }
          }),
          api.get("/farewell-templates")
        ]);
        setCloseReasons(reasons || []);
        setFarewellTemplates(templates || []);
      } catch (err) {
        toastError(err);
      }
    };

    loadData();
  }, [open, ticket?.id, ticket?.queueId]);

  const handleClose = () => {
    setSelectedReasonId("");
    setSelectedFarewellTemplateId("");
    setHasValidationError(false);
    onClose();
  };

  const handleConfirm = () => {
    if (!selectedReasonId) {
      setHasValidationError(true);
      return;
    }

    onConfirm({
      closeReasonId: Number(selectedReasonId),
      farewellTemplateId: selectedFarewellTemplateId
        ? Number(selectedFarewellTemplateId)
        : null
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Finalizar atendimento</DialogTitle>
      <DialogContent dividers>
        <FormControl
          fullWidth
          variant="outlined"
          margin="dense"
          error={hasValidationError && !selectedReasonId}
        >
          <InputLabel id="close-reason-label">Motivo de encerramento *</InputLabel>
          <Select
            labelId="close-reason-label"
            value={selectedReasonId}
            onChange={event => {
              setSelectedReasonId(event.target.value);
              setHasValidationError(false);
            }}
            label="Motivo de encerramento *"
          >
            {closeReasons.map(reason => (
              <MenuItem key={reason.id} value={reason.id}>
                {reason.name}
              </MenuItem>
            ))}
          </Select>
          {hasValidationError && !selectedReasonId && (
            <FormHelperText>Selecione um motivo para encerrar.</FormHelperText>
          )}
        </FormControl>

        <FormControl fullWidth variant="outlined" margin="dense">
          <InputLabel id="farewell-template-label">Mensagem de despedida (opcional)</InputLabel>
          <Select
            labelId="farewell-template-label"
            value={selectedFarewellTemplateId}
            onChange={event => setSelectedFarewellTemplateId(event.target.value)}
            label="Mensagem de despedida (opcional)"
          >
            <MenuItem value="">
              <em>Sem mensagem de despedida</em>
            </MenuItem>
            {farewellTemplates.map(template => (
              <MenuItem key={template.id} value={template.id}>
                {template.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleConfirm} color="primary" variant="contained" disabled={loading}>
          Confirmar fechamento
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketCloseModal;
