'use client';

import { LoadingButton } from '@/components/common/loading-button';
import { clientFetch } from '@/lib/fetch/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function CreateQuestionButton() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const handleCreateQuestion = async () => {
    if (isCreating) return;

    let navigated = false;
    setIsCreating(true);

    try {
      const result = await clientFetch<{ questionId: string }>(
        '/api/questions',
        {
          method: 'POST',
        },
      );

      if (!result.ok) {
        toast.error('기술 질문 생성에 실패했습니다.', {
          description: '잠시 후 다시 시도해주세요.',
        });
        return;
      }

      const { questionId } = result.data;

      navigated = true;
      router.push(`/questions/${questionId}`);
    } catch {
      toast.error('네트워크 오류가 발생했습니다.', {
        description: '인터넷 연결을 확인한 후 다시 시도해주세요.',
      });
    } finally {
      if (!navigated) setIsCreating(false);
    }
  };

  return (
    <LoadingButton
      onClick={handleCreateQuestion}
      isLoading={isCreating}
      loadingText="기술 질문 생성 중..."
    >
      기술 질문 생성하기
    </LoadingButton>
  );
}
