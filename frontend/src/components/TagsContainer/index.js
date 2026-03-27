import { Chip, Paper, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React, { useEffect, useRef, useState } from "react";
import { isArray, isString } from "lodash";
import toastError from "../../errors/toastError";
import api from "../../services/api";

export function TagsContainer ({ ticket, contact, compact = false }) {

    const [tags, setTags] = useState([]);
    const [selecteds, setSelecteds] = useState([]);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])

    const normalizeTag = (item) => {
        if (!item) return null;
        if (isString(item)) {
            const name = item.trim();
            return name ? { name } : null;
        }
        return item;
    };

    useEffect(() => {
        if (!isMounted.current) return;
        loadTags();
        const sourceTags = Array.isArray(ticket?.tags)
            ? ticket.tags
            : (Array.isArray(contact?.tags) ? contact.tags : []);
        setSelecteds(sourceTags.filter(Boolean));
    }, [ticket?.id, contact?.id, ticket?.tags, contact?.tags]);

    const createTag = async (data) => {
        try {
            const { data: responseData } = await api.post(`/tags`, data);
            return responseData;
        } catch (err) {
            toastError(err);
        }
    }

    const loadTags = async () => {
        try {
            const { data } = await api.get(`/tags/list`);
            setTags(data);
        } catch (err) {
            toastError(err);
        }
    }

    const syncTags = async (data) => {
        try {
            const { data: responseData } = await api.post(`/tags/sync`, data);
            return responseData;
        } catch (err) {
            toastError(err);
        }
    }

    const onChange = async (value, reason) => {
        let optionsChanged = []
        if (reason === 'create-option') {
            if (isArray(value)) {
                for (let item of value) {
                    const normalized = normalizeTag(item);
                    if (!normalized) continue;
                    if (isString(item)) {
                        if (normalized.name.length > 2) {
                            const newTag = await createTag({ name: normalized.name })
                            if (newTag) optionsChanged.push(newTag);
                        }
                    } else {
                        optionsChanged.push(normalized);
                    }
                }
            }
            await loadTags();
        } else {
            optionsChanged = (value || []).map(normalizeTag).filter(Boolean);
        }
        setSelecteds(optionsChanged);
        const response = await syncTags({ ticketId: ticket?.id, contactId: contact?.id, tags: optionsChanged });
        if (Array.isArray(response?.tags)) {
            setSelecteds(response.tags);
        }
    }

    return (
            <Autocomplete
                multiple
                size="small"
                options={tags}
                value={selecteds}
                freeSolo
                onChange={(e, v, r) => onChange(v, r)}
                getOptionLabel={(option) => (isString(option) ? option : (option?.name || ""))}
                isOptionEqualToValue={(option, value) =>
                    (option?.id && value?.id && option.id === value.id) ||
                    (option?.name || "").toLowerCase() === (value?.name || "").toLowerCase()
                }
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            variant="outlined"
                            style={{
                              color: "white",
                              backgroundColor: option.color || '#eee',
                              textShadow: "-1px 0 #808080, 0 1px #808080, 1px 0 #808080, 0 -1px #808080"
                            }}
                            label={option?.name || ""}
                            {...getTagProps({ index })}
                            size="small"
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" placeholder="Tags" />
                )}
                PaperComponent={({ children }) => (
                    <Paper style={{ width: compact ? "100%" : 400, marginLeft: compact ? 0 : 12 }}>
                        {children}
                    </Paper>
                )}
            />
    )
}