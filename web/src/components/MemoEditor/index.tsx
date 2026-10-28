import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import useCurrentUser from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { useTranslate } from "@/utils/i18n";
import { convertVisibilityFromString } from "@/utils/memo";
import { EditorContent, EditorMetadata, FocusModeOverlay } from "./components";
import { FOCUS_MODE_STYLES } from "./constants";
import type { EditorFileOrigin } from "./Editor/extensions";
import {
  splitInlineLocalFiles,
  toLocalFiles,
  useAutoSave,
  useBlobUrls,
  useFocusMode,
  useInlineImageUpload,
  useMemoInit,
  useMemoSave,
} from "./hooks";
import { cacheService } from "./services";
import { EditorProvider, useEditorContext, useEditorSelector } from "./state";
import { EditorToolbar } from "./Toolbar";
import type { MemoEditorProps } from "./types";
import type { EditorController } from "./types/editorController";

const MemoEditor = (props: MemoEditorProps) => (
  <EditorProvider initialFocusMode={Boolean(props.onFocusModeExit)}>
    <MemoEditorImpl {...props} />
  </EditorProvider>
);

const MemoEditorImpl: React.FC<MemoEditorProps> = ({
  className,
  cacheKey,
  memo,
  parentMemoName,
  defaultSpace,
  defaultLocation,
  autoFocus,
  onFocusModeExit,
  onFocusModeChange,
  placeholder,
  defaultCreateTime,
  onConfirm,
  onCancel,
  onSavingChange,
}) => {
  const t = useTranslate();
  const currentUser = useCurrentUser();
  const editorRef = useRef<EditorController>(null);
  const { actions, dispatch, getState } = useEditorContext();
  const isFocusMode = useEditorSelector((state) => state.ui.isFocusMode);
  const isSaving = useEditorSelector((state) => state.ui.isLoading.saving);
  const { userGeneralSetting } = useAuth();
  const { createBlobUrl } = useBlobUrls();
  const saveMediaMetadata = userGeneralSetting?.saveMediaMetadata ?? false;
  const inlineImageUpload = useInlineImageUpload(editorRef);
  const memoName = memo?.name;
  const defaultVisibility = userGeneralSetting?.memoVisibility ? convertVisibilityFromString(userGeneralSetting.memoVisibility) : undefined;
  const editorCacheKey = cacheService.key(currentUser?.name ?? "", cacheKey);

  const { isInitialized } = useMemoInit({
    editorRef,
    memo,
    cacheKey,
    username: currentUser?.name ?? "",
    autoFocus,
    defaultVisibility,
    defaultCreateTime,
    defaultLocation,
  });
  const { discardDraft } = useAutoSave(currentUser?.name ?? "", cacheKey, isInitialized && !memo);
  const { containerRef: editorContainerRef, placeholderHeight } = useFocusMode(isFocusMode);

  useEffect(() => {
    onFocusModeChange?.(isFocusMode);
  }, [isFocusMode, onFocusModeChange]);

  useEffect(() => {
    onSavingChange?.(isSaving);
  }, [isSaving, onSavingChange]);

  useEffect(() => {
    if (memo || !defaultCreateTime || !isInitialized) return;
    dispatch(actions.setTimestamps({ createTime: defaultCreateTime, updateTime: defaultCreateTime }));
  }, [defaultCreateTime, memo, isInitialized, actions, dispatch]);

  const rememberCursor = useCallback(() => {
    const cursor = editorRef.current?.getCursor();
    if (cursor !== undefined) cacheService.saveCursor(editorCacheKey, cursor);
  }, [editorCacheKey]);

  const handleToggleFocusMode = () => {
    if (isSaving) return;
    if (onFocusModeExit) {
      rememberCursor();
      onFocusModeExit();
      return;
    }
    dispatch(actions.toggleFocusMode());
  };

  const handleCancel = useCallback(() => {
    rememberCursor();
    onCancel?.();
  }, [onCancel, rememberCursor]);

  const handleEditorFiles = useCallback(
    (files: File[], origin: EditorFileOrigin) => {
      if (getState().ui.isLoading.saving) return;
      const localFiles = toLocalFiles(files, { createBlobUrl, saveMediaMetadata });
      const { inline, attachments } =
        origin.source === "drop" ? splitInlineLocalFiles(localFiles) : { inline: [], attachments: localFiles };
      attachments.forEach((file) => dispatch(actions.addLocalFile(file)));
      if (origin.source === "drop") inlineImageUpload.insertLocalImages(inline, origin.position);
    },
    [actions, createBlobUrl, dispatch, getState, inlineImageUpload.insertLocalImages, saveMediaMetadata],
  );

  const handleSave = useMemoSave({
    memoName,
    parentMemoName,
    defaultSpace,
    defaultVisibility,
    defaultCreateTime,
    discardDraft,
    onConfirm,
    onCancel: onCancel ? handleCancel : undefined,
  });

  return (
    <>
      <FocusModeOverlay isActive={isFocusMode} onToggle={handleToggleFocusMode} />
      {isFocusMode && placeholderHeight > 0 && (
        <div aria-hidden className={cn("w-full", className)} style={{ height: placeholderHeight }} />
      )}
      <div
        ref={editorContainerRef}
        className={cn(
          "group relative w-full flex flex-col justify-between items-start bg-card px-5 py-4 rounded-xl border border-border/60 gap-4",
          FOCUS_MODE_STYLES.transition,
          isFocusMode && cn(FOCUS_MODE_STYLES.container.base, FOCUS_MODE_STYLES.container.spacing),
          !isFocusMode && className,
        )}
      >
        {isFocusMode && (
          <div className="flex w-full items-center justify-between">
            <span className="text-sm text-muted-foreground">{memoName ? t("common.edit") : t("editor.new-memo")}</span>
            <Button variant="quiet" size="sm" onClick={handleToggleFocusMode} disabled={isSaving}>
              {t("common.close")}
            </Button>
          </div>
        )}
        <EditorContent
          ref={editorRef}
          placeholder={placeholder || t("editor.any-thoughts")}
          onSubmit={handleSave}
          onFiles={handleEditorFiles}
        />
        <div className="w-full flex flex-col gap-2">
          <EditorMetadata
            memoName={memoName}
            uploadingLocalFileURLs={inlineImageUpload.uploadingLocalFileURLs}
            onInsertAttachments={inlineImageUpload.insertRemoteImages}
            onInsertLocalFiles={inlineImageUpload.insertLocalImages}
          />
          <EditorToolbar onSave={handleSave} onCancel={onCancel ? handleCancel : undefined} />
        </div>
      </div>
    </>
  );
};

export default MemoEditor;
