import React, { useMemo, useState, useEffect } from "react";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

const FullscreenImageDialog = ({ open, imageUrl, onClose, alt = "image-preview" }) => {
  const [sourceUrl, setSourceUrl] = useState("");

  const enhancedUrl = useMemo(() => {
    if (!imageUrl) return "";
    // Upgrade common avatar thumbnails (e.g. WhatsApp s96x96) to higher resolution.
    return String(imageUrl).replace(/s96x96/gi, "s640x640");
  }, [imageUrl]);

  useEffect(() => {
    setSourceUrl(enhancedUrl);
  }, [enhancedUrl, open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        style: {
          backgroundColor: "rgba(0,0,0,0.95)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }
      }}
    >
      <IconButton
        onClick={onClose}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          color: "#fff",
          zIndex: 2
        }}
      >
        <CloseIcon />
      </IconButton>

      {sourceUrl ? (
        <img
          src={sourceUrl}
          alt={alt}
          onError={() => {
            // Fallback to original URL if high-res variant is unavailable.
            if (sourceUrl !== imageUrl) {
              setSourceUrl(imageUrl || "");
            }
          }}
          style={{
            width: "95vw",
            height: "95vh",
            objectFit: "contain",
            display: "block"
          }}
        />
      ) : null}
    </Dialog>
  );
};

export default FullscreenImageDialog;
