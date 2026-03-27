import { useState, useEffect, useCallback, useRef } from 'react';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';
import ClearIcon from '@material-ui/icons/Clear';
import List from '@material-ui/core/List';
import { makeStyles } from '@material-ui/core/styles';
import * as Yup from "yup";
import { Formik } from "formik";
import TicketNotesItem from '../TicketNotesItem';
import ConfirmationModal from '../ConfirmationModal';
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import useTicketNotes from '../../hooks/useTicketNotes';
import { Grid } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  rootCompact: {
    '& .MuiTextField-root': {
      margin: theme.spacing(0),
      width: '100%',
    },
  },
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '350px',
    },
  },
  list: {
    width: '100%',
    maxWidth: '350px',
    maxHeight: '200px',
    backgroundColor: theme.palette.background.paper,
    overflow: 'auto'
  },
  listCompact: {
    width: '100%',
    maxWidth: '100%',
    maxHeight: '220px',
    backgroundColor: theme.palette.background.paper,
    overflow: 'auto'
  },
  inline: {
    width: '100%'
  },
  textFieldWrapper: {
    position: 'relative',
    width: '100%',
  },
  adornment: {
    position: 'absolute',
    top: 0,
    right: 0,
    display: 'flex',
    zIndex: 3,
    marginTop: -12,
    marginRight: 10,
    background: theme.palette.background.paper,
  },
  smallIcon: {
    fontSize: 24,
  },
}));

const NoteSchema = Yup.object().shape({
  note: Yup.string()
    .min(2, "Too Short!")
    .required("Required")
});

export function TicketNotes({ ticket, compact = false }) {
  const { id: ticketId, contactId } = ticket;
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [showOnDeleteDialog, setShowOnDeleteDialog] = useState(false);
  const [selectedNote, setSelectedNote] = useState({});
  const [notes, setNotes] = useState([]);
  const { saveNote, deleteNote, listNotes } = useTicketNotes();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const notes = await listNotes({ ticketId, contactId });
      if (!mountedRef.current) return;
      setNotes(notes);
    } catch (e) {
      toast.error(e);
    }
    if (!mountedRef.current) return;
    setLoading(false);
  }, [listNotes, ticketId, contactId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleSave = async (note, resetForm) => {
    setLoading(true);
    try {
      await saveNote({
        note,
        ticketId,
        contactId
      });
      await loadNotes();
      resetForm();
      toast.success(i18n.t("common.success"));
    } catch (e) {
      toast.error(e);
    }
    setLoading(false);
  };

  const handleOpenDialogDelete = (item) => {
    setSelectedNote(item);
    setShowOnDeleteDialog(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteNote(selectedNote.id);
      await loadNotes();
      setSelectedNote({});
      toast.success(i18n.t("common.success"));
    } catch (e) {
      toast.error(e);
    }
    setLoading(false);
  };

  const renderNoteList = () => {
    return notes.map((note) => {
      return <TicketNotesItem
        note={note}
        key={note.id}
        deleteItem={handleOpenDialogDelete}
      />;
    });
  };

  return (
    <>
      <ConfirmationModal
        title={i18n.t("common.delete")}
        open={showOnDeleteDialog}
        onClose={setShowOnDeleteDialog}
        onConfirm={handleDelete} />
      <div className={compact ? classes.rootCompact : undefined}>
        <Formik
          initialValues={{ note: "" }}
          enableReinitialize={false}
          validationSchema={NoteSchema}
          onSubmit={(values, { resetForm }) => handleSave(values.note, resetForm)}
        >
          {({ values, handleChange, handleBlur, resetForm, submitForm }) => (
            <Grid container spacing={compact ? 1 : 2}>
              {notes.length > 0 && (
                <Grid xs={12} item>
                  <List className={compact ? classes.listCompact : classes.list}>
                    {renderNoteList()}
                  </List>
                </Grid>
              )}
              <Grid xs={12} item>
                <div className={classes.textFieldWrapper}>
                  <TextField
                    name="note"
                    minRows={compact ? 2 : 3}
                    label={i18n.t("ticketOptionsMenu.appointmentsModal.textarea")}
                    placeholder={i18n.t("ticketOptionsMenu.appointmentsModal.placeholder")}
                    multiline
                    value={values.note}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    variant="outlined"
                    fullWidth
                    size={compact ? "small" : "medium"}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submitForm();
                      }
                    }}
                  />
                  {values.note && (
                    <div className={classes.adornment}>
                      <IconButton
                        aria-label="save"
                        onClick={submitForm}
                        disabled={loading}
                        size="small"
                      >
                        <SaveIcon className={classes.smallIcon} />
                      </IconButton>
                      <IconButton
                        aria-label="clear"
                        onClick={() => resetForm()}
                        disabled={loading}
                        size="small"
                      >
                        <ClearIcon className={classes.smallIcon} />
                      </IconButton>
                    </div>
                  )}
                </div>
              </Grid>
            </Grid>
          )}
        </Formik>
      </div>
    </>
  );
}
