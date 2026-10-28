import { CheckIcon, LoaderIcon } from "lucide-react";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import VisibilityIcon from "@/components/VisibilityIcon";
import { useTranslate } from "@/utils/i18n";
import { getVisibilityOption } from "@/utils/memo";
import { validationService } from "../services";
import { useEditorSelector } from "../state";
import type { EditorToolbarProps } from "../types";

export const EditorToolbar: FC<EditorToolbarProps> = ({ onSave, onCancel }) => {
  const t = useTranslate();
  const valid = useEditorSelector((state) => validationService.canSave(state).valid);
  const blockedReason = useEditorSelector((state) => validationService.canSave(state).reason);
  const blockedReasonDetail = useEditorSelector((state) => validationService.canSave(state).detail);
  const isSaving = useEditorSelector((state) => state.ui.isLoading.saving);
  const justSaved = useEditorSelector((state) => state.ui.justSaved);
  const visibility = useEditorSelector((state) => state.metadata.visibility);
  const visibilityOption = getVisibilityOption(visibility);
  const committing = isSaving || justSaved;
  const blockedMessage =
    valid || committing
      ? undefined
      : blockedReason
        ? t(blockedReason, blockedReasonDetail ? { url: blockedReasonDetail } : undefined)
        : t("editor.validation.cannot-save");

  const saveButton = (
    <Button size="sm" onClick={onSave} disabled={committing || !valid}>
      {isSaving ? <LoaderIcon className="size-3.5 animate-spin" /> : justSaved ? <CheckIcon className="size-3.5" /> : null}
      {justSaved ? t("editor.saved") : t("editor.save")}
    </Button>
  );

  return (
    <div className="flex w-full items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <VisibilityIcon visibility={visibility} className="size-3.5" />
        {visibilityOption ? t(visibilityOption.labelKey) : ""}
      </span>
      <div className="flex items-center gap-2">
        {onCancel && (
          <Button variant="quiet" size="sm" onClick={onCancel} disabled={committing}>
            {t("common.cancel")}
          </Button>
        )}
        {blockedMessage ? (
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" tabIndex={0} aria-label={blockedMessage} />}>{saveButton}</TooltipTrigger>
            <TooltipContent>{blockedMessage}</TooltipContent>
          </Tooltip>
        ) : (
          saveButton
        )}
      </div>
    </div>
  );
};
