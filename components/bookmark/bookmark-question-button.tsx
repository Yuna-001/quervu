'use client';

import { clientFetch } from '@/lib/fetch/client';
import { Bookmark } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type BookmarkQuestionButtonProps = {
  questionId: string;
  initialIsBookmarked: boolean;
  className?: string;
  size?: number;
};

export function BookmarkQuestionButton({
  questionId,
  initialIsBookmarked,
  className,
  size = 32,
}: BookmarkQuestionButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isSaving, setIsSaving] = useState(false);

  const handleBookmark = async () => {
    if (isSaving) return;

    const prev = isBookmarked;
    const next = !prev;

    setIsBookmarked(next);
    setIsSaving(true);

    try {
      const result = await clientFetch(
        `/api/questions/${questionId}/bookmark`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isBookmarked: next }),
          expectNoContent: true,
        },
      );

      if (!result.ok) {
        setIsBookmarked(prev);
        toast.error('북마크 변경에 실패했습니다.');
      }
    } catch {
      setIsBookmarked(prev);
      toast.error('네트워크 오류가 발생했습니다.', {
        description: '인터넷 연결을 확인한 후 다시 시도해주세요.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBookmark}
      disabled={isSaving}
      aria-pressed={isBookmarked}
      aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
      className={`cursor-pointer ${className ?? ''}`}
    >
      <Bookmark
        className={`stroke-orange-400 stroke-2 ${
          isBookmarked ? 'fill-orange-400' : 'fill-transparent'
        }`}
        size={size}
      />
    </button>
  );
}
