import React, { useState } from "react";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";

import { i18n } from "../../translate/i18n";
import { Button, CircularProgress, Divider, Grid, TextField, Typography } from "@material-ui/core";
import SettingsModuleLayout from "../../components/SettingsModuleLayout";
import { Field, Form, Formik } from "formik";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { getBackendURL } from "../../services/config";

const useStyles = makeStyles((theme) => ({
  section: {
    padding: theme.spacing(2.5),
    borderRadius: 12,
    border: "1px solid #e8e8e8",
    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#1d1d1f",
    marginBottom: theme.spacing(1),
  },
  muted: {
    fontSize: 14,
    color: "#86868b",
    lineHeight: 1.5,
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    paddingBottom: 100
  },
  mainHeader: {
    marginTop: theme.spacing(1),
  },
  elementMargin: {
    marginTop: theme.spacing(2),
  },
  formContainer: {
    maxWidth: 500,
  },
  textRight: {
    textAlign: "right"
  }
}));

const MessagesAPI = () => {
  const classes = useStyles();

  const [formMessageTextData,] = useState({ token: '',number: '', body: '' })
  const [formMessageMediaData,] = useState({ token: '', number: '', medias: '' })
  const [file, setFile] = useState({})

  const getEndpoint = () => {
    return getBackendURL() + '/api/messages/send'
  }

  const handleSendTextMessage = async (values) => {
    const { number, body } = values;
    const data = { number, body };
    var options = {
      method: 'POST',
      url: `${getBackendURL()}/api/messages/send`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${values.token}`
      },
      data
    };
    
    axios.request(options).then(function (response) {
      toast.success('Mensagem enviada com sucesso');
    }).catch(function (error) {
      toastError(error);
    });    
  }

  const handleSendMediaMessage = async (values) => { 
    try {
      const firstFile =  file[0];
      const data = new FormData();
      data.append('number', values.number);
      data.append('body', firstFile.name);
      data.append('medias', firstFile);
      var options = {
        method: 'POST',
        url: `${getBackendURL()}/api/messages/send`,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${values.token}`
        },
        data
      };
      
      axios.request(options).then(function (response) {
        toast.success('Mensagem enviada com sucesso');
      }).catch(function (error) {
        toastError(error);
      });      
    } catch (err) {
      toastError(err);
    }
  }

  const renderFormMessageText = () => {
    return (
      <Formik
        initialValues={formMessageTextData}
        enableReinitialize={true}
        onSubmit={(values, actions) => {
          setTimeout(async () => {
            await handleSendTextMessage(values);
            actions.setSubmitting(false);
            actions.resetForm()
          }, 400);
        }}
        className={classes.elementMargin}
      >
        {({ isSubmitting }) => (
          <Form className={classes.formContainer}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.token")}
                  name="token"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.number")}
                  name="number"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.textMessage.body")}
                  name="body"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  required
                />
              </Grid>
              <Grid item xs={12} className={classes.textRight}>
                <Button
									type="submit"
									color="primary"
									variant="contained"
									className={classes.btnWrapper}
								>
									{isSubmitting ? (
										<CircularProgress
											size={24}
											className={classes.buttonProgress}
										/>
									) : 'Enviar'}
								</Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    )
  }

  const renderFormMessageMedia = () => {
    return (
      <Formik
        initialValues={formMessageMediaData}
        enableReinitialize={true}
        onSubmit={(values, actions) => {
          setTimeout(async () => {
        
            await handleSendMediaMessage(values);
            actions.setSubmitting(false);
            actions.resetForm()
            document.getElementById('medias').files = null
            document.getElementById('medias').value = null
          }, 400);
        }}
        className={classes.elementMargin}
      >
        {({ isSubmitting }) => (
          <Form className={classes.formContainer}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.mediaMessage.token")}
                  name="token"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field
                  as={TextField}
                  label={i18n.t("messagesAPI.mediaMessage.number")}
                  name="number"
                  autoFocus
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  className={classes.textField}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <input type="file" name="medias" id="medias" required onChange={(e) => setFile(e.target.files)} />
              </Grid>
              <Grid item xs={12} className={classes.textRight}>
                <Button
									type="submit"
									color="primary"
									variant="contained"
									className={classes.btnWrapper}
								>
									{isSubmitting ? (
										<CircularProgress
											size={24}
											className={classes.buttonProgress}
										/>
									) : 'Enviar'}
								</Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    )
  }

  return (
    <SettingsModuleLayout
      embedded
      title="Integrações · API e mensagens"
      description="Tokens de API por conexão, endpoint de envio e área de testes. Webhooks e log de integrações podem ser estendidos no backend conforme necessidade."
    >
      <Paper className={classes.section} elevation={0}>
        <Typography className={classes.sectionTitle}>Tokens e conexões</Typography>
        <Typography className={classes.muted}>
          Cadastre o token em <strong>Configurações → Canais / Adaptadores</strong>, editando a conexão desejada.
          Cada token autentica requisições <code>Bearer</code> para a conexão correspondente.
        </Typography>
      </Paper>

      <Paper className={classes.section} elevation={0}>
        <Typography className={classes.sectionTitle}>Webhooks e logs</Typography>
        <Typography className={classes.muted}>
          O projeto possui rotas e eventos internos que podem ser documentados aqui quando houver URL de webhook
          exposta. Registre chamadas e erros no seu gateway ou em uma fila de auditoria externa até centralizarmos logs
          nesta tela.
        </Typography>
      </Paper>

      <Paper className={classes.mainPaper} elevation={0} style={{ border: "1px solid #e8e8e8", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
      <Typography variant="h6" style={{ fontWeight: 700 }}>
        Documentação para envio de mensagens
      </Typography>
      <Typography variant="subtitle1" color="primary" className={classes.elementMargin}>
        Métodos de envio
      </Typography>
      <Typography component="div">
        <ol>
          <li>Mensagens de texto</li>
          <li>Mensagens de mídia</li>
        </ol>
      </Typography>
      <Divider className={classes.elementMargin} />
      <Typography variant="subtitle1" style={{ fontWeight: 600 }} className={classes.elementMargin}>
        Instruções
      </Typography>
      <Typography className={classes.elementMargin} component="div">
        <b>Observações importantes</b><br />
        <ul>
          <li>Antes de enviar mensagens, cadastre o token na conexão que enviará as mensagens (Configurações → Canais / Adaptadores).</li>
          <li>
            O campo número aceita:
              <ul>
                <li><b>Número de WhatsApp:</b> completo com DDI (BR=55).</li>
                <li><b>JID:</b> identificador WhatsApp; grupos terminam em @g.us.</li>
              </ul>
          </li>
        </ul>
      </Typography>
      <Typography variant="subtitle1" color="primary" className={classes.elementMargin}>
        1. Mensagens de texto
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography className={classes.elementMargin} component="div">
            <p>Informações para envio:</p>
            <b>Endpoint: </b> {getEndpoint()} <br />
            <b>Método: </b> POST <br />
            <b>Headers: </b> Authorization (&quot;Bearer &quot; + token) e Content-Type application/json <br />
            <b>Body: </b> {"{ \"number\": \"558599999999\", \"body\": \"Sua mensagem\", \"saveOnTicket\": true, \"linkPreview\": true }"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography className={classes.elementMargin}>
            <b>Teste de envio</b>
          </Typography>
          {renderFormMessageText()}
        </Grid>
      </Grid>
      <Typography variant="subtitle1" color="primary" className={classes.elementMargin}>
        2. Mensagens de mídia
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography className={classes.elementMargin} component="div">
            <p>Envio multipart:</p>
            <b>Endpoint: </b> {getEndpoint()} <br />
            <b>Método: </b> POST <br />
            <b>Headers: </b> Authorization (&quot;Bearer &quot; + token) e Content-Type multipart/form-data <br />
            <b>FormData: </b> <br />
            <ul>
              <li>
                <b>number: </b> 558599999999
              </li>
              <li>
                <b>medias: </b> arquivo
              </li>
              <li>
                <b>saveOnTicket: </b> true
              </li>
            </ul>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography className={classes.elementMargin}>
            <b>Teste de envio</b>
          </Typography>
          {renderFormMessageMedia()}
        </Grid>
      </Grid>
    </Paper>
    </SettingsModuleLayout>
  );
};

export default MessagesAPI;