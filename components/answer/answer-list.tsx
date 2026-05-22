import { AnswerPreviewCard } from '@/components/answer/answer-preview-card';
import type { AnswerListItem } from '@/types/answer';

export function AnswerList({
  questionId,
  items,
}: {
  questionId: string;
  items: AnswerListItem[];
}) {
  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item.answerId}>
          <AnswerPreviewCard questionId={questionId} answer={item} />
        </li>
      ))}
    </ul>
  );
}
