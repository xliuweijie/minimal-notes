import { create } from "@bufbuild/protobuf";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MemoReactionListView from "@/components/MemoReactionListView";
import { MemoSchema, ReactionSchema } from "@/types/proto/api/v1/memo_service_pb";

vi.mock("@/components/MemoReactionListView/hooks", () => ({
  useReactionGroups: () => new Map([["👍", [{ username: "alice" }]]]),
}));

vi.mock("@/components/MemoReactionListView/ReactionView", () => ({
  default: ({ reactionType }: { reactionType: string }) => <span>{reactionType}</span>,
}));

describe("MemoReactionListView", () => {
  it("preserves existing reactions without an emoji picker", () => {
    const reactions = [create(ReactionSchema, { reactionType: "👍", creator: "users/alice" })];
    const memo = create(MemoSchema, { name: "memos/1", reactions });
    const { container } = render(<MemoReactionListView memo={memo} reactions={reactions} />);

    expect(screen.getByText("👍")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container.querySelector("[aria-haspopup]")).toBeNull();
  });

  it("renders nothing when there are no reactions", () => {
    const memo = create(MemoSchema, { name: "memos/1" });
    const { container } = render(<MemoReactionListView memo={memo} reactions={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
