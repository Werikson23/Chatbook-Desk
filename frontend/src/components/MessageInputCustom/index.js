import React, { useState, useEffect, useContext, useRef } from "react";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import MicRecorder from "mic-recorder-to-mp3";
import clsx from "clsx";

import { 
  Code,
  FormatListNumbered,
  FormatListBulleted,
  FormatQuote,
  Link as LinkIcon,
} from "@material-ui/icons";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import IconButton from "@material-ui/core/IconButton";
import MoodIcon from "@material-ui/icons/Mood";
import SendIcon from "@material-ui/icons/Send";
import CancelIcon from "@material-ui/icons/Cancel";
import ClearIcon from "@material-ui/icons/Clear";
import MicIcon from "@material-ui/icons/Mic";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import CameraAltIcon from "@material-ui/icons/CameraAlt";
import { InputAdornment, Typography, Popper, TextField, Button } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { isString, isEmpty, isObject, has } from "lodash";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import RecordingTimer from "./RecordingTimer";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import useTicketNotes from "../../hooks/useTicketNotes";
import { EditMessageContext } from "../../context/EditingMessage/EditingMessageContext";

import useQuickMessages from "../../hooks/useQuickMessages";

import Compressor from 'compressorjs';
import LinearWithValueLabel from "./ProgressBarCustom";
import WhatsMarked from "react-whatsmarked";
import { isMobile } from "../../helpers/isMobile";
import { SocketContext } from "../../context/Socket/SocketContext";
import useSettings from "../../hooks/useSettings";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
  },

  newMessageBox: {
    width: "100%",
    display: "flex",
    padding: "7px",
    alignItems: "center",
  },

  messageInputWrapper: {
    padding: 6,
    marginRight: 7,
    //background: "#fff",
    border: "1px solid #ccc",
    display: "flex",
    borderRadius: 20,
    flex: 1,
  },

  messageInput: {
    paddingLeft: 10,
    flex: 1,
    border: "none",
  },

  cameraIcon: {
    color: "grey",
  },

  sendMessageIcons: {
    color: "grey",
  },

  uploadInput: {
    display: "none",
  },

  viewMediaInputWrapper: {
    display: "flex",
    padding: "10px 13px",
    position: "relative",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eee",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
  },

  emojiBox: {
    position: "absolute",
    bottom: 63,
    width: 40,
    borderTop: "1px solid #e8e8e8",
  },

  circleLoading: {
    color: green[500],
    opacity: "70%",
    position: "absolute",
    top: "20%",
    left: "50%",
    marginLeft: -12,
  },

  audioLoading: {
    color: green[500],
    opacity: "70%",
  },

  recorderWrapper: {
    display: "flex",
    alignItems: "center",
    alignContent: "middle",
  },

  cancelAudioIcon: {
    color: "red",
  },

  sendAudioIcon: {
    color: "green",
  },

  replyginMsgWrapper: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingLeft: 73,
    paddingRight: 7,
  },

  replyginMsgContainer: {
    flex: 1,
    marginRight: 5,
    overflowY: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },

  replyginMsgBody: {
    padding: 10,
    height: "auto",
    display: "block",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  },

  replyginContactMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#35cd96",
  },

  replyginSelfMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#6bcbef",
  },

  messageContactName: {
    display: "flex",
    color: "#6bcbef",
    fontWeight: 500,
  },

  iconSwitch: {
    color: (props) => (props.value ? theme.palette.primary.main : "gray"),
    width: 48,
    height: 48
  },

  formatMenu: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderRadius: 30,
    boxShadow: theme.shadows[2],
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
  },

  cwMainWrapper: {
    background: "#1c1e21",
    border: "1px solid #2b2e33",
    borderRadius: 8,
    margin: "0 16px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    // Prevent cutting footer icons when textarea area changes.
    overflow: "visible",
  },
  cwMainWrapperNote: {
    background: "#2d2417",
    borderColor: "#524021",
  },
  cwTabs: {
    display: "flex",
    gap: 8,
    padding: "12px 16px 0",
    background: "#1c1e21",
  },
  cwTabsNote: {
    background: "#2d2417",
    borderBottom: "1px solid #524021",
  },
  cwTab: {
    padding: "6px 12px",
    borderRadius: 20,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    border: "none",
    background: "transparent",
    color: "#9b9ba8",
    fontFamily: "inherit",
  },
  cwTabActive: {
    background: "#2b3035",
    color: "#f8f9fa",
    fontWeight: 600,
  },
  cwTabActiveNote: {
    background: "rgba(234, 179, 8, 0.2)",
    color: "#eab308",
  },
  cwScheduleRow: {
    padding: "6px 12px",
    background: "#16161a",
    borderBottom: "1px solid #2a2a2e",
  },
  cwScheduleField: {
    width: "100%",
    maxWidth: 320,
  },
  cwComposerRow: {
    display: "flex",
    padding: 0,
    width: "100%",
    minHeight: 0,
    flex: "1 1 auto",
  },
  cwMessageInputWrapper: {
    flex: 1,
    margin: 0,
    borderRadius: 0,
    background: "transparent",
    border: "none",
    padding: 0,
  },
  cwInputNote: {
    background: "#2d2417 !important",
    borderColor: "#524021 !important",
    color: "#f8f4e4 !important",
  },
  cwInputBase: {
    color: "#e8e8ec",
    width: "100%",
    fontSize: 14,
    lineHeight: 1.45,
    minHeight: 80,
    padding: "16px",
    // Prevent textarea growth from pushing/clipping footer icons.
    maxHeight: 110,
    overflowY: "auto",
    "& textarea": {
      maxHeight: 110,
      overflowY: "auto",
      resize: "none",
    },
  },
  cwToolbar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 16px",
    borderBottom: "1px solid #2b2e33",
    background: "#1c1e21",
    flex: "none",
    flexShrink: 0,
  },
  cwToolbarNote: {
    background: "#2d2417",
    borderBottom: "1px solid #524021",
  },
  cwToolbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  cwToolBtn: {
    padding: 0,
    color: "#b8b8c0",
    borderRadius: 6,
  },
  cwAiBtn: {
    padding: 6,
    color: "#9ca3af",
  },
  cwFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderTop: "none",
    background: "#1c1e21",
    flex: "none",
    flexShrink: 0,
  },
  cwFooterNote: {
    background: "#2d2417",
    borderTop: "1px solid #524021",
  },
  cwFooterActions: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    "& .MuiIconButton-root": {
      color: "#9ca3af",
      padding: 0,
    },
    "& .MuiSvgIcon-root": {
      fontSize: 20,
    },
  },
  cwSendBtn: {
    background: "#1c64f2",
    color: "#fff",
    textTransform: "none",
    borderRadius: 6,
    padding: "4px 12px",
    fontWeight: 600,
    fontSize: 13,
    minWidth: 96,
    height: 34,
    boxShadow: "none",
    "&:hover": {
      background: "#1a56db",
    },
  },
  cwHint: {
    fontSize: 11,
    color: "#6c6c78",
    padding: "0 16px 10px",
    lineHeight: 1.4,
    display: "none",
  },
  cwPendingBanner: {
    background: "rgba(234, 179, 8, 0.12)",
    borderTop: "1px solid #524021",
    color: "#facc15",
    fontSize: 12,
    fontWeight: 600,
    padding: "8px 16px",
  },
}));

const EmojiOptions = (props) => {
  const { disabled, showEmoji, setShowEmoji, handleAddEmoji } = props;
  const classes = useStyles();
  return (
    <>
      <IconButton
        aria-label="emojiPicker"
        component="span"
        disabled={disabled}
        onClick={(e) => setShowEmoji((prevState) => !prevState)}
      >
        <MoodIcon className={classes.sendMessageIcons} />
      </IconButton>
      {showEmoji ? (
        <div className={classes.emojiBox}>
          <Picker
            perLine={16}
            showPreview={false}
            showSkinTones={false}
            onSelect={handleAddEmoji}
          />
        </div>
      ) : null}
    </>
  );
};

const FileInput = (props) => {
  const { handleChangeMedias, disableOption } = props;
  const classes = useStyles();
  return (
    <>
      <input
        multiple
        type="file"
        id="upload-button"
        disabled={disableOption}
        className={classes.uploadInput}
        onChange={handleChangeMedias}
      />
      <label htmlFor="upload-button">
        <IconButton
          aria-label="upload"
          component="span"
          disabled={disableOption}
        >
          <AttachFileIcon className={classes.sendMessageIcons} />
        </IconButton>
      </label>
    </>
  );
};

const ActionButtons = (props) => {
  const {
    inputMessage,
    loading,
    recording,
    ticketStatus,
    handleSendMessage,
    handleCancelAudio,
    handleUploadAudio,
    handleStartRecording,
    disableOption,
    suppressSendButton,
  } = props;
  const classes = useStyles();
  if (inputMessage) {
    if (suppressSendButton) {
      return null;
    }
    return (
      <IconButton
        aria-label="sendMessage"
        component="span"
        onClick={handleSendMessage}
        disabled={disableOption}
      >
        <SendIcon className={classes.sendMessageIcons} />
      </IconButton>
    );
  } else if (recording) {
    return (
      <div className={classes.recorderWrapper}>
        <IconButton
          aria-label="cancelRecording"
          component="span"
          fontSize="large"
          disabled={disableOption}
          onClick={handleCancelAudio}
        >
          <HighlightOffIcon className={classes.cancelAudioIcon} />
        </IconButton>
        {loading ? (
          <div>
            <CircularProgress className={classes.audioLoading} />
          </div>
        ) : (
          <RecordingTimer />
        )}

        <IconButton
          aria-label="sendRecordedAudio"
          component="span"
          onClick={handleUploadAudio}
          disabled={disableOption}
        >
          <CheckCircleOutlineIcon className={classes.sendAudioIcon} />
        </IconButton>
      </div>
    );
  } else {
    return (
      <IconButton
        aria-label="showRecorder"
        component="span"
        disabled={disableOption}
        onClick={handleStartRecording}
      >
        <MicIcon className={classes.sendMessageIcons} />
      </IconButton>
    );
  }
};

function UpwardPopper(props) {
  return (
    <Popper
      {...props}
      placement="top-start" // force always upwards
      modifiers={{
        flip: { enabled: false },            // disable flipping
        preventOverflow: { enabled: false }, // disable overflow adjustment
      }}
    />
  );
}

const CustomInput = (props) => {
  const {
    loading,
    inputRef,
    ticketStatus,
    inputMessage,
    setInputMessage,
    handleSendMessage,
    handleInputPaste,
    handleChangeMedias,
    handlePresenceUpdate,
    disableOption,
    chatwoot = false,
    composerMode = "reply",
  } = props;
  const classes = useStyles();
  const [quickMessages, setQuickMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);

  const { user } = useContext(AuthContext);

  const { list: listQuickMessages } = useQuickMessages();

  useEffect(() => {
    const handleClickAway = (event) => {
      const menu = document.getElementById('format-menu');
      if (menu && !menu.contains(event.target)) {
        menu.style.display = 'none';
      }
    };
    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, []);

  useEffect(() => {
    async function fetchData() {
      const messages = await listQuickMessages();
      const options = messages.map((m) => {
        let truncatedMessage = m.message;
        if (isString(truncatedMessage) && truncatedMessage.length > 35) {
          truncatedMessage = m.message.substring(0, 35) + "...";
        }
        return {
          value: m.message,
          label: `/${m.shortcode} - ${truncatedMessage}`,
        };
      });
      setQuickMessages(options);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      isString(inputMessage) &&
      !isEmpty(inputMessage) &&
      inputMessage.length
    ) {
      const firstWord = inputMessage.charAt(0);
      setPopupOpen(firstWord.indexOf("/") > -1);

      const filteredOptions = quickMessages.filter(
        (m) => m.label.toLowerCase().indexOf(inputMessage.toLowerCase()) > -1
      );
      setOptions(filteredOptions);
    } else {
      setPopupOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMessage]);

  const onKeyPress = (e) => {
    if (loading) return;
    else if ( !e.shiftKey && e.key === "Enter" && !isMobile()) {
      e.preventDefault();
      handleSendMessage();
      return;
    }
    handlePresenceUpdate && handlePresenceUpdate("composing");
  };

  const onPaste = (e) => {
    if (ticketStatus === "open") {
      handleInputPaste(e);
    }
  };

  const renderPlaceholder = () => {
    if (ticketStatus === "pending") {
      return "Conversa aguardando atendimento. Clique em Aceitar para responder.";
    }
    if (chatwoot) {
      if (composerMode === "note") {
        return "Write a private note...";
      }
      return "Shift + enter for new line. Start with '/' to select a Canned Response.";
    }
    if (ticketStatus === "open") {
      return i18n.t("messagesInput.placeholderOpen");
    }
    return i18n.t("messagesInput.placeholderClosed");
  };

  const setInputRef = (input) => {
    if (input) {
      inputRef.current = input;
      inputRef.current.spellcheck = true;
    }
  };

  const showFormatMenu = () => {
    const selection = window.getSelection();
    const menuElement = document.getElementById('format-menu');
    if (!selection?.toString()) {
      menuElement.style.display = 'none';
    } else {
      menuElement.style.display = 'flex';
      menuElement.style.top = `${selection.anchorNode.offsetTop - 40}px`;
      menuElement.style.left = `${selection.anchorNode.offsetLeft}px`;
    }
  };
  
  const formatText = (prefix, suffix) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (selectedText) {
      let formattedText = `${prefix}${selectedText}${suffix}`;
      const textArea = inputRef.current;
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const textBefore = inputMessage.substring(0, start);
      const textAfter = inputMessage.substring(end);
      
      const prevChar = textBefore.charAt(start - 1);
      if (prevChar && prevChar !== ' ' && prevChar !== '\n') {
        formattedText = ` ${formattedText}`;
      }
      
      const nextChar = textAfter.charAt(0);
      if (nextChar && nextChar !== ' ' && nextChar !== '\n') {
        formattedText = `${formattedText} `;
      }
      
      setInputMessage(textBefore + formattedText + textAfter);
      document.getElementById('format-menu').style.display = 'none';
      setTimeout(() => {
        textArea.focus();
        textArea.setSelectionRange(
          start + prefix.length - 1,
          start + prefix.length + formattedText.length - 1
        );
        showFormatMenu();
      }, 0);
    }
  };

  const splitSelectionLines = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    if (selectedText) {
      const textArea = inputRef.current;
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;

      const firstLineStart = inputMessage.substring(0, start).lastIndexOf("\n")+1;
      const lastLineEnd = end+inputMessage.substring(end).indexOf("\n");
      const textBefore = inputMessage.substring(0, firstLineStart);
      const textAfter = inputMessage.substring(lastLineEnd);

      const lines = inputMessage.substring(firstLineStart, lastLineEnd).split('\n');
      return { lines, textBefore, textAfter };
    }
    return { lines: [], textBefore: inputMessage, textAfter: "" };
  };
  
  const formatCode = () => {
    const selection = window.getSelection();
    if (selection.toString().indexOf('\n') === -1) {
      formatText('`', '`');
      return;
    }
      
    const { lines, textBefore, textAfter } = splitSelectionLines();
    if (lines.length > 0) {
      const formattedText = "```\n" + lines.join('\n') + "\n```\n";
      setInputMessage(textBefore + formattedText + textAfter);
      setTimeout(() => {
        const textArea = inputRef.current;
        textArea.focus();
        textArea.setSelectionRange(
          textBefore.length,
          textBefore.length + formattedText.length
        );
        showFormatMenu();
      }, 0);
    }
  };

  const formatListNumbered = () => {
    const { lines, textBefore, textAfter } = splitSelectionLines();
    if (lines.length > 0) {
      const formattedLines = lines.map((line, index) => `${index + 1}. ${line}`);
      const formattedText = formattedLines.join('\n');

      setInputMessage(textBefore + formattedText + textAfter);
      setTimeout(() => {
        const textArea = inputRef.current;
        textArea.focus();
        textArea.setSelectionRange(
          textBefore.length,
          textBefore.length + formattedText.length
        );
        showFormatMenu();
      }, 0);
    }
  };

  const formatListBulleted = () => {
    const { lines, textBefore, textAfter } = splitSelectionLines();
    if (lines.length > 0) {
      const formattedLines = lines.map(line => `* ${line}`);
      const formattedText = formattedLines.join('\n');

      setInputMessage(textBefore + formattedText + textAfter);
      setTimeout(() => {
        const textArea = inputRef.current;
        textArea.focus();
        textArea.setSelectionRange(
          textBefore.length,
          textBefore.length + formattedText.length
        );
        showFormatMenu();
      }, 0);
    }
  };

  const formatQuote = () => {
    const { lines, textBefore, textAfter } = splitSelectionLines();
    if (lines.length > 0) {
      const formattedLines = lines.map(line => `> ${line}`);
      const formattedText = formattedLines.join('\n');

      setInputMessage(textBefore + formattedText + textAfter);
      setTimeout(() => {
        const textArea = inputRef.current;
        textArea.focus();
        textArea.setSelectionRange(
          textBefore.length,
          textBefore.length + formattedText.length
        );
        showFormatMenu();
      }, 0);
    }
  };

  return (
    <div
      className={clsx(classes.messageInputWrapper, {
        [classes.cwMessageInputWrapper]: chatwoot,
      })}
    >
      <Autocomplete
        disabled={disableOption}
        freeSolo
        open={popupOpen}
        PopperComponent={UpwardPopper}
        id="grouped-demo"
        value={inputMessage}
        options={options}
        closeIcon={null}
        getOptionLabel={(option) => {
          if (isObject(option)) {
            return option.label;
          } else {
            return option;
          }
        }}
        onChange={(event, opt) => {
          if (isObject(opt) && has(opt, "value")) {
            setInputMessage(opt.value);
            setTimeout(() => {
              inputRef.current.scrollTop = inputRef.current.scrollHeight;
            }, 200);
          }
        }}
        onInputChange={(event, opt, reason) => {
          if (reason === "input") {
            setInputMessage(event.target.value);
          }
        }}
        onPaste={onPaste}
        onKeyPress={onKeyPress}
        style={{ width: "100%" }}
        renderInput={(params) => {
          const { InputLabelProps, InputProps, ...rest } = params;
          return (
            <>
            <InputBase
              {...params.InputProps}
              {...rest}
              disabled={disableOption}
              inputRef={(input) => setInputRef(input)}
              placeholder={renderPlaceholder()}
              multiline
              className={clsx(classes.messageInput, {
                [classes.cwInputBase]: chatwoot,
                [classes.cwInputNote]: chatwoot && composerMode === "note",
              })}
              maxRows={chatwoot ? 4 : 5}
              endAdornment={
                isMobile() &&
                <InputAdornment position="end">
                  <input
                    type="file"
                    id="camera-button"
                    accept="image/*"
                    capture="camera"
                    className={classes.uploadInput}
                    onChange={handleChangeMedias}
                  />
                  <label htmlFor="camera-button">
                    <IconButton
                      aria-label="camera-upload"
                      component="span"
                      disabled={disableOption}
                    >
                      <CameraAltIcon className={classes.cameraIcon} />
                    </IconButton>
                  </label>
                </InputAdornment>
              }    
              onKeyDownCapture={(e) => {
                if (
                  !popupOpen && (
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowDown'
                  )
                ) {
                  e.stopPropagation();
                }
              }}
              onMouseUp={showFormatMenu}
              onKeyUp={showFormatMenu}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === 'b') {
                  e.preventDefault();
                  formatText('*', '*');
                } else if (e.ctrlKey && e.key === 'i') {
                  e.preventDefault();
                  formatText('_', '_');
                } else if (e.ctrlKey && e.key === 's') {
                  e.preventDefault();
                  formatText('~', '~');
                } else if (e.ctrlKey && e.key === 'm') {
                  e.preventDefault();
                  formatCode();
                } else if (e.ctrlKey && e.key === 'q') {
                  e.preventDefault();
                  formatQuote();
                } else if (e.ctrlKey && e.key === 'n') {
                  e.preventDefault();
                  formatListNumbered();
                } else if (e.ctrlKey && e.key === 'l') {
                  e.preventDefault();
                  formatListBulleted();
                }
              }}
            />
            <div
              id="format-menu"
              className={classes.formatMenu}
              style={{ display: 'none', position: 'absolute', zIndex: 1000 }}
            >
              <IconButton 
                size="small" 
                onClick={() => formatText('*','*')}
                style={{ padding: '6px', margin: '0 2px' }}
              >
                <Typography style={{ fontWeight: 'bold', fontSize: '15px' }}>B</Typography>
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => formatText('_','_')}
                style={{ padding: '6px', margin: '0 2px' }}
              >
                <Typography style={{ fontStyle: 'italic', fontSize: '15px' }}>I</Typography>
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => formatText('~','~')}
                style={{ padding: '6px', margin: '0 2px' }}
              >
                <Typography style={{ textDecoration: 'line-through', fontSize: '15px' }}>S</Typography>
              </IconButton>
              <IconButton 
                size="small" 
                onClick={formatCode}
                style={{ padding: '6px', margin: '0 2px' }}
              >
                <Code fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={formatListNumbered}
                style={{ padding: '6px', margin: '0 2px' }}
              >
                <FormatListNumbered fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={formatListBulleted}
                style={{ padding: '6px', margin: '0 2px' }}
              >
                <FormatListBulleted fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={formatQuote}
                style={{ padding: '6px', margin: '0 2px' }}
              >
                <FormatQuote fontSize="small" />
              </IconButton>
            </div>
            </>
          );
        }}
      />
    </div>
  );
};

const MessageInputCustom = (props) => {
  const { ticket, showTabGroups, chatwoot = false, onNoteSaved } = props;
  const { status: ticketStatus, id: ticketId } = ticket;
  const classes = useStyles();

  const [medias, setMedias] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [percentLoading, setPercentLoading] = useState(0);
  const [composerMode, setComposerMode] = useState("reply");
  const [scheduleAt, setScheduleAt] = useState("");

  const inputRef = useRef();
  const { saveNote } = useTicketNotes();
  const { setReplyingMessage, replyingMessage } =
    useContext(ReplyMessageContext);
  const { setEditingMessage, editingMessage } = useContext(
		EditMessageContext
	);  
  const { user } = useContext(AuthContext);
  const { getSetting } = useSettings();
  const [messageSignatureMode, setMessageSignatureMode] = useState("optional");

  const socketManager = useContext(SocketContext);
  const [socket, setSocket] = useState(null);
  const [currentPresence, setCurrentPresence] = useState(null);
  const [presenceTimeout, setPresenceTimeout] = useState(null);
  const shouldSignMessages =
    messageSignatureMode === "required" ||
    (messageSignatureMode === "optional" && user?.signatureEnabled !== false);

  useEffect(() => {
    getSetting("message_signature_mode", "optional")
      .then((mode) => setMessageSignatureMode(mode || "optional"))
      .catch(() => setMessageSignatureMode("optional"));
  }, [getSetting]);

  useEffect(() => {
    if (!inputMessage) {
      sessionStorage.removeItem("messageDraft-" + ticketId);
      return;
    }
    sessionStorage.setItem("messageDraft-" + ticketId, inputMessage);
  }, [inputMessage]);

  useEffect(() => {
    const draftMessage = sessionStorage.getItem("messageDraft-" + ticketId);
    if (draftMessage) {
      setInputMessage(draftMessage);
    }
  }, [ticketId]);

  useEffect(() => {
    const socket = socketManager.GetSocket();
    if (socket) {
      setSocket(socket);
    }
    return () => {
      socket.disconnect();
    };
  }, [socketManager]);        

  useEffect(() => {
    if (editingMessage) {
      if (editingMessage.body.startsWith(`*${user.name}:*\n`)) {
        setInputMessage(editingMessage.body.substr(editingMessage.body.indexOf("\n")+1));
      } else {
        setInputMessage(editingMessage.body);
      }
    }
    
    if (replyingMessage || editingMessage) {
      inputRef.current.focus();
    }
    
  }, [replyingMessage, editingMessage, user.name]);

  useEffect(() => {
    if (replyingMessage || editingMessage) {
      setComposerMode("reply");
    }
  }, [replyingMessage, editingMessage]);

  useEffect(() => {
    inputRef.current.focus();
    return () => {
      setShowEmoji(false);
      setMedias([]);
      setReplyingMessage(null);
      setEditingMessage(null);
      setInputMessage("");
    };
  }, [ticketId]);

  // const handleChangeInput = e => {
  // 	if (isObject(e) && has(e, 'value')) {
  // 		setInputMessage(e.value);
  // 	} else {
  // 		setInputMessage(e.target.value)
  // 	}
  // };

  const handleAddEmoji = (e) => {
    let emoji = e.native;
    setInputMessage((prevState) => prevState + emoji);
  };

  const handleChangeMedias = (e) => {
    if (!e.target.files) {
      return;
    }

    const selectedMedias = Array.from(e.target.files);
    setMedias(selectedMedias);
  };

  const handleInputPaste = (e) => {
    if (e.clipboardData.files[0]) {
      setMedias([e.clipboardData.files[0]]);
    }
  };

  const handleUploadMedia = async (e) => {
    if (disableOption || disableSend || composerMode === "note") return;
    setLoading(true);
    e.preventDefault();
    const compressIfImage = (file) =>
      new Promise((resolve, reject) => {
        if (!file?.type?.startsWith("image/")) {
          resolve(file);
          return;
        }
        new Compressor(file, {
          quality: 0.7,
          success(result) {
            resolve(result);
          },
          error(error) {
            reject(error);
          }
        });
      });

    try {
      for (const media of medias) {
        const processedMedia = await compressIfImage(media);
        const formData = new FormData();
        formData.append("fromMe", true);
        formData.append("medias", processedMedia, processedMedia.name || media.name);
        formData.append("body", processedMedia.name || media.name);

        await api.post(`/messages/${ticketId}`, formData, {
          onUploadProgress: (event) => {
            const total = event.total || event.loaded || 1;
            const progress = Math.round((event.loaded * 100) / total);
            setPercentLoading(progress);
          }
        });
      }

      setMedias([]);
      setPercentLoading(0);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresenceUpdate = (presence) => {
    if (!socket || currentPresence === presence) return;
    
    if (presenceTimeout) {
      clearTimeout(presenceTimeout);
      setPresenceTimeout(null);
    }
    
    if (!presence) {
      setCurrentPresence(null);
      socket.emit("presenceUpdate", {
        ticketId,
        presence: "paused",
      });
      return;
    }
    
    setCurrentPresence(presence);
    socket.emit("presenceUpdate", {
      ticketId,
      presence,
    });

    if (presence === "composing") {
      setPresenceTimeout(
        setTimeout(() => {
          setCurrentPresence(null);
          socket.emit("presenceUpdate", {
            ticketId,
            presence: "paused",
          });
        }, 5000)
      );
    }
  }

  const applyWrap = (mark) => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const t = inputMessage;
    const sel = t.slice(start, end);
    if (sel) {
      const next = t.slice(0, start) + mark + sel + mark + t.slice(end);
      setInputMessage(next);
      setTimeout(() => {
        el.focus();
        const pos = start + mark.length + sel.length + mark.length;
        el.setSelectionRange(pos, pos);
      }, 0);
    } else {
      const next = t.slice(0, start) + mark + mark + t.slice(end);
      setInputMessage(next);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + mark.length, start + mark.length);
      }, 0);
    }
  };

  const applyLinePrefix = (prefix, numbered = false) => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const t = inputMessage;
    const block = t.slice(start, end) || "";
    const lines = (block || "").split("\n");
    const mapped = lines.map((line, idx) =>
      numbered ? `${idx + 1}. ${line}` : `${prefix}${line}`
    );
    const next = t.slice(0, start) + mapped.join("\n") + t.slice(end);
    setInputMessage(next);
    setTimeout(() => {
      el.focus();
      const pos = start + mapped.join("\n").length;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const formatListBulleted = () => applyLinePrefix("* ");
  const formatListNumbered = () => applyLinePrefix("", true);

  const formatCode = () => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const t = inputMessage;
    const sel = t.slice(start, end);
    if (!sel.includes("\n")) {
      applyWrap("`");
      return;
    }
    const wrapped = `\`\`\`\n${sel}\n\`\`\``;
    const next = t.slice(0, start) + wrapped + t.slice(end);
    setInputMessage(next);
    setTimeout(() => {
      el.focus();
      const pos = start + wrapped.length;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const formatLink = () => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const t = inputMessage;
    const sel = t.slice(start, end).trim() || "texto";
    const wrapped = `[${sel}](https://)`;
    const next = t.slice(0, start) + wrapped + t.slice(end);
    setInputMessage(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + wrapped.length, start + wrapped.length);
    }, 0);
  };

  const handleSendMessage = async () => {
    if (composerMode === "schedule") {
      toast.info(i18n.t("messagesInput.composer.scheduleSoon"));
      return;
    }

    // Block sending while ticket is pending (except Private Note mode).
    if (disableSend) return;

    if (composerMode === "note") {
      if (inputMessage.trim() === "") return;
      setLoading(true);
      try {
        const contactId = ticket.contactId ?? ticket.contact?.id ?? 0;
        await saveNote({
          note: inputMessage.trim(),
          ticketId,
          contactId,
        });
        toast.success(i18n.t("messagesInput.composer.noteSaved"));
        if (typeof onNoteSaved === "function") {
          await onNoteSaved();
        }
        setInputMessage("");
        setShowEmoji(false);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (inputMessage.trim() === "") return;
    setLoading(true);

    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: shouldSignMessages
        ? `*${user?.name}:*\n${inputMessage.trim()}`
        : inputMessage.trim(),
      quotedMsg: replyingMessage,
    };

    handlePresenceUpdate(null);

    const url = editingMessage !== null ?
      `/messages/edit/${editingMessage.id}` :
      `/messages/${ticketId}`;
    api.post(url, message).catch((err) => {
      toastError(err);
    });

    setInputMessage("");
    setShowEmoji(false);
    setLoading(false);
    setReplyingMessage(null);
    setEditingMessage(null);
    inputRef.current.focus();
  };

  const handleStartRecording = async () => {
    if (disableOption || disableSend || composerMode === "note") return;
    setLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await Mp3Recorder.start();
      setRecording(true);
      setLoading(false);
      handlePresenceUpdate("recording");
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const handleUploadAudio = async () => {
    if (disableOption || disableSend || composerMode === "note") return;
    setLoading(true);
    handlePresenceUpdate(null);
    try {
      const [, blob] = await Mp3Recorder.stop().getMp3();
      if (blob.size < 10000) {
        setLoading(false);
        setRecording(false);
        return;
      }

      const formData = new FormData();
      const filename = `audio-record-site-${new Date().getTime()}.mp3`;
      formData.append("medias", blob, filename);
      formData.append("body", filename);
      formData.append("fromMe", true);

      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
    }

    setRecording(false);
    setLoading(false);
  };

  const handleCancelAudio = async () => {
    handlePresenceUpdate(null);
    try {
      await Mp3Recorder.stop().getMp3();
      setRecording(false);
    } catch (err) {
      toastError(err);
    }
  };

  const isGroup = showTabGroups && ticket.isGroup;
  const isPending = ticketStatus === "pending";
  // While pending we still allow typing and note draft, but we block sending.
  const disableOption = (!isGroup && loading) || ticketStatus === "closed";
  const disableSend = isPending && composerMode !== "note";

  const renderReplyingMessage = (message) => {
    return (
      <div className={classes.replyginMsgWrapper}>
        <div className={classes.replyginMsgContainer}>
          <span
            className={clsx(classes.replyginContactMsgSideColor, {
              [classes.replyginSelfMsgSideColor]: !message.fromMe,
            })}
          ></span>
          {replyingMessage && (
            <div className={classes.replyginMsgBody}>
              <span className={classes.messageContactName}>
                {i18n.t("messagesInput.replying")} {message.contact?.name}
              </span>
              <WhatsMarked>
                { message.body.startsWith('{"ticketzvCard":') ? "🪪" : message.body }
              </WhatsMarked>
            </div>
          )}
          {editingMessage && (
            <div className={classes.replyginMsgBody}>
              <span className={classes.messageContactName}>
                {i18n.t("messagesInput.editing")}
              </span>
              <WhatsMarked>
                {message.body}
              </WhatsMarked>
            </div>
          )}
        </div>
        <IconButton
          aria-label="showRecorder"
          component="span"
          disabled={disableOption}
          onClick={() => {
              setReplyingMessage(null);
              setEditingMessage(null);
              setInputMessage("");
          }}
        >
          <ClearIcon className={classes.sendMessageIcons} />
        </IconButton>
      </div>
    );
  };

  if (medias.length > 0)
    return (
      <Paper elevation={0} square className={classes.viewMediaInputWrapper}>
        <IconButton
          aria-label="cancel-upload"
          component="span"
          disabled={disableOption}
          onClick={(e) => setMedias([])}
        >
          <CancelIcon className={classes.sendMessageIcons} />
        </IconButton>

        {loading ? (
          <div>
            {/*<CircularProgress className={classes.circleLoading} />*/}
            <LinearWithValueLabel progress={percentLoading} />
          </div>
        ) : (
          <span>
            {medias[0]?.name}
            {/* <img src={media.preview} alt=""></img> */}
          </span>
        )}
        <IconButton
          aria-label="send-upload"
          component="span"
          onClick={handleUploadMedia}
          disabled={disableOption || disableSend || composerMode === "note"}
        >
          <SendIcon className={classes.sendMessageIcons} />
        </IconButton>
      </Paper>
    );
  else {
    const composerTabs = chatwoot
      ? [
          { id: "reply", label: "Reply" },
          { id: "note", label: "Private Note" },
        ]
      : [
          { id: "reply", label: i18n.t("messagesInput.composer.reply") },
          { id: "note", label: i18n.t("messagesInput.composer.note") },
          { id: "quick", label: i18n.t("messagesInput.composer.quick") },
          { id: "schedule", label: i18n.t("messagesInput.composer.schedule") },
        ];

    return (
      <Paper
        square
        elevation={0}
        className={clsx(
          classes.mainWrapper,
          chatwoot && classes.cwMainWrapper,
          chatwoot && composerMode === "note" && classes.cwMainWrapperNote
        )}
      >
        {(replyingMessage && renderReplyingMessage(replyingMessage)) ||
          (editingMessage && renderReplyingMessage(editingMessage))}
        {chatwoot && !editingMessage && (
          <div
            className={clsx(
              classes.cwTabs,
              composerMode === "note" && classes.cwTabsNote
            )}
            role="tablist"
          >
            {composerTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={composerMode === tab.id}
                className={clsx(classes.cwTab, {
                  [classes.cwTabActive]: composerMode === tab.id,
                  [classes.cwTabActiveNote]:
                    composerMode === "note" && tab.id === "note",
                })}
                disabled={disableOption}
                onClick={() => setComposerMode(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
        {chatwoot && composerMode === "schedule" && (
          <div className={classes.cwScheduleRow}>
            <TextField
              type="datetime-local"
              size="small"
              fullWidth
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
              className={classes.cwScheduleField}
              InputLabelProps={{ shrink: true }}
              label={i18n.t("messagesInput.composer.schedule")}
              disabled={disableOption}
            />
          </div>
        )}
        {chatwoot && (
          <>
            {isPending && (
              <div className={classes.cwPendingBanner}>
                Conversa aguardando atendimento. Clique em Aceitar para liberar o envio de mensagens.
              </div>
            )}
            <div
              className={clsx(
                classes.cwToolbar,
                composerMode === "note" && classes.cwToolbarNote
              )}
            >
              <div className={classes.cwToolbarLeft}>
                <IconButton
                  size="small"
                  className={classes.cwToolBtn}
                  onClick={() => applyWrap("*")}
                  disabled={disableOption}
                >
                  <Typography variant="body2" style={{ fontWeight: 700 }}>
                    B
                  </Typography>
                </IconButton>
                <IconButton
                  size="small"
                  className={classes.cwToolBtn}
                  onClick={() => applyWrap("_")}
                  disabled={disableOption}
                >
                  <Typography variant="body2" style={{ fontStyle: "italic" }}>
                    I
                  </Typography>
                </IconButton>
                <IconButton
                  size="small"
                  className={classes.cwToolBtn}
                  onClick={() => applyWrap("~")}
                  disabled={disableOption}
                >
                  <Typography
                    variant="body2"
                    style={{ textDecoration: "line-through" }}
                  >
                    S
                  </Typography>
                </IconButton>
                <IconButton
                  size="small"
                  className={classes.cwToolBtn}
                  onClick={formatLink}
                  disabled={disableOption}
                >
                  <LinkIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  className={classes.cwToolBtn}
                  onClick={formatListBulleted}
                  disabled={disableOption}
                >
                  <Typography variant="body2">•</Typography>
                </IconButton>
                <IconButton
                  size="small"
                  className={classes.cwToolBtn}
                  onClick={formatListNumbered}
                  disabled={disableOption}
                >
                  <Typography variant="body2">1.</Typography>
                </IconButton>
                <IconButton
                  size="small"
                  className={classes.cwToolBtn}
                  onClick={formatCode}
                  disabled={disableOption}
                >
                  <Typography variant="body2">&lt;/&gt;</Typography>
                </IconButton>
              </div>
            </div>
            <div className={classes.cwComposerRow}>
              <CustomInput
                loading={loading}
                inputRef={inputRef}
                ticketStatus={(isGroup && "open") || ticketStatus}
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                handleSendMessage={handleSendMessage}
                handleInputPaste={handleInputPaste}
                handleChangeMedias={handleChangeMedias}
                handlePresenceUpdate={handlePresenceUpdate}
                disableOption={disableOption}
                chatwoot={chatwoot}
                composerMode={composerMode}
              />
            </div>
            <div
              className={clsx(
                classes.cwFooter,
                composerMode === "note" && classes.cwFooterNote
              )}
            >
              <div className={classes.cwFooterActions}>
                {isMobile() || (
                  <EmojiOptions
                    disabled={disableOption}
                    handleAddEmoji={handleAddEmoji}
                    showEmoji={showEmoji}
                    setShowEmoji={setShowEmoji}
                  />
                )}
                {composerMode !== "schedule" && (
                  <>
                    <FileInput
                      disableOption={
                        disableOption || disableSend || composerMode === "note"
                      }
                      handleChangeMedias={handleChangeMedias}
                    />
                    <IconButton
                      size="small"
                      className={classes.cwAiBtn}
                      disabled={
                        disableOption || disableSend || composerMode === "note"
                      }
                      onClick={handleStartRecording}
                    >
                      <MicIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      className={classes.cwAiBtn}
                      disabled={disableOption || disableSend}
                    >
                      <Code fontSize="small" />
                    </IconButton>
                  </>
                )}
              </div>
              <Button
                variant="contained"
                className={classes.cwSendBtn}
                onClick={handleSendMessage}
                disabled={
                  disableOption ||
                  disableSend ||
                  (composerMode === "note" && !inputMessage.trim()) ||
                  (composerMode !== "note" &&
                    composerMode !== "schedule" &&
                    !inputMessage.trim() &&
                    !recording)
                }
              >
                Send (↵)
              </Button>
            </div>
          </>
        )}
        {!chatwoot && (
          <div
            className={clsx({
              [classes.newMessageBox]: !chatwoot,
            })}
          >
            {isMobile() || (
              <EmojiOptions
                disabled={disableOption}
                handleAddEmoji={handleAddEmoji}
                showEmoji={showEmoji}
                setShowEmoji={setShowEmoji}
              />
            )}
            <FileInput
              disableOption={
                disableOption || disableSend || composerMode === "note"
              }
              handleChangeMedias={handleChangeMedias}
            />
            <CustomInput
              loading={loading}
              inputRef={inputRef}
              ticketStatus={(isGroup && "open") || ticketStatus}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              handleSendMessage={handleSendMessage}
              handleInputPaste={handleInputPaste}
              handleChangeMedias={handleChangeMedias}
              handlePresenceUpdate={handlePresenceUpdate}
              disableOption={disableOption}
              chatwoot={chatwoot}
              composerMode={composerMode}
            />
            <ActionButtons
              inputMessage={inputMessage}
              loading={loading}
              recording={recording}
              ticketStatus={ticketStatus}
              disableOption={disableOption || disableSend}
              handleSendMessage={handleSendMessage}
              handleCancelAudio={handleCancelAudio}
              handleUploadAudio={handleUploadAudio}
              handleStartRecording={handleStartRecording}
            />
          </div>
        )}
      </Paper>
    );
  }
};

export default withWidth()(MessageInputCustom);
