import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EditorProvider } from "@/components/MemoEditor/state";
import { createInitialState } from "@/components/MemoEditor/state/types";
import { EditorToolbar } from "@/components/MemoEditor/Toolbar/EditorToolbar";
import { Visibility } from "@/types/proto/api/v1/memo_service_pb";

vi.mock("@/utils/i18n", () => ({ useTranslate: () => (key: string) => key }));

const renderToolbar = (options: { content?: string; saving?: boolean; saved?: boolean; visibility?: Visibility } = {}) => {
  const state = createInitialState();
  state.content = options.content ?? "一条简单的笔记";
  state.ui.isLoading.saving = options.saving ?? false;
  state.ui.justSaved = options.saved ?? false;
  state.metadata.visibility = options.visibility ?? Visibility.PRIVATE;
  const onSave = vi.fn();
  const onCancel = vi.fn();
  render(
    <EditorProvider initialEditorState={state}>
      <EditorToolbar onSave={onSave} onCancel={onCancel} />
    </EditorProvider>,
  );
  return { onSave, onCancel };
};

describe("minimal editor toolbar", () => {
  it("offers only save and cancel actions", () => {
    const { onSave, onCancel } = renderToolbar();
    expect(screen.getAllByRole("button")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "editor.save" }));
    fireEvent.click(screen.getByRole("button", { name: "common.cancel" }));
    expect(onSave).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("blocks saving an empty note", () => {
    renderToolbar({ content: "" });
    expect(screen.getByRole("button", { name: "editor.save" })).toBeDisabled();
  });

  it("blocks both actions while saving", () => {
    renderToolbar({ saving: true });
    expect(screen.getByRole("button", { name: "editor.save" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "common.cancel" })).toBeDisabled();
  });

  it("keeps the saved confirmation disabled", () => {
    renderToolbar({ saved: true });
    expect(screen.getByRole("button", { name: "editor.saved" })).toBeDisabled();
  });

  it("still warns about the audience without a visibility menu", () => {
    renderToolbar({ visibility: Visibility.PUBLIC });
    expect(screen.getByText("memo.visibility.public")).toBeInTheDocument();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
