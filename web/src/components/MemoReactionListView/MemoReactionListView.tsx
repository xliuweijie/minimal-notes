import { memo } from "react";
import type { Memo, Reaction } from "@/types/proto/api/v1/memo_service_pb";
import { useReactionGroups } from "./hooks";
import ReactionView from "./ReactionView";

interface Props {
  memo: Memo;
  reactions: Reaction[];
}

const MemoReactionListView = (props: Props) => {
  const { memo: memoData, reactions } = props;
  const reactionGroup = useReactionGroups(reactions);

  if (reactions.length === 0) {
    return null;
  }

  return (
    // Chips are filled surfaces, so their box edge, not their padding, sits on the text edge.
    <div className="flex w-full flex-row flex-wrap items-center justify-start gap-1 select-none">
      {Array.from(reactionGroup).map(([reactionType, users]) => (
        <ReactionView key={`${reactionType.toString()} ${users.length}`} memo={memoData} reactionType={reactionType} users={users} />
      ))}
    </div>
  );
};

export default memo(MemoReactionListView);
