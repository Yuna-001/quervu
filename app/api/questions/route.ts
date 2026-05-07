import { openai } from '@/lib/ai/client';
import { requireUserId } from '@/lib/auth/requireUserId';
import dbConnect from '@/lib/dbConnect';
import { HttpError } from '@/lib/error';
import ProfileModel from '@/models/profile';
import QuestionModel from '@/models/question';
import type { Profile } from '@/types/profile';
import { NextResponse } from 'next/server';

type GeneratedQuestion = {
  content: string;
  idealAnswer: string;
  tags: string[];
};

/**
 * 사용자 소개 정보를 기반으로 OpenAI에 요청하여
 * 면접 질문/모범 답변/태그를 포함한 JSON 응답을 생성한다.
 */
async function createQuestionResponse({
  introduction,
  maxTokens,
}: {
  introduction: string;
  maxTokens: number;
}) {
  return openai.responses.create({
    model: 'gpt-4.1-mini',
    input: [
      {
        role: 'system',
        content: [
          '당신은 기술 면접관입니다.',
          '아래 후보자 프로필을 보고, 해당 후보에게 적절한 기술 면접 질문 하나를 만드세요.',
          '',
          '응답은 반드시 **JSON 형식**으로만 출력해야 합니다.',
          '다른 설명 문장(예: 설명 텍스트, 마크다운 등)은 절대 쓰지 마세요.',
          '',
          'JSON 구조는 다음과 같습니다:',
          '{',
          '  "content": "질문 문장",',
          '  "idealAnswer": "모범 답변",',
          '  "tags": ["react", "typescript", "nextjs"]',
          '}',
          '',
          '규칙:',
          '- content와 idealAnswer는 모두 한국어로 작성합니다.',
          '- tags는 영어 소문자 기술 이름만 사용합니다. 예: ["react", "typescript", "nextjs", "frontend"].',
          '- 태그 개수는 1개 이상 5개 이하로 만듭니다.',
          '- user 메시지에는 "이미 받은 질문 목록"이 함께 제공될 수 있습니다.',
          '  이 목록에 포함된 질문과 동일하거나, 내용이 매우 비슷한 질문은 절대 생성하지 마세요.',
          '- idealAnswer는 500자 이내의 존댓말로 작성합니다.',
          '- content와 idealAnswer에 코드/마크다운/백틱/줄바꿈을 포함하지 마세요.',
        ].join('\n'),
      },
      {
        role: 'user',
        content: introduction,
      },
    ],
    text: {
      format: { type: 'json_object' },
    },
    max_output_tokens: maxTokens,
  });
}

// POST /api/questions
// - 사용자 프로필 기반 면접 질문을 생성·저장하고 questionId를 반환하는 핸들러
export async function POST() {
  let userId: string;

  try {
    ({ userId } = await requireUserId());
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.error('POST /api/questions unexpected error in requireUserId', err);

    // 인증 이외의 예기치 못한 서버 오류
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }

  try {
    await dbConnect();

    // 현재 사용자 프로필, 사용자의 이전 질문 목록(최대 50개) 조회
    const [profile, prevQuestions] = await Promise.all([
      ProfileModel.findOne({
        userId,
      }).lean<Profile | null>(),
      QuestionModel.find({ userId })
        .select('content')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean<{ content: string }[]>(),
    ]);

    // 프로필이 없으면 질문을 생성할 수 없으므로 400 반환
    if (!profile) {
      return NextResponse.json(
        { error: '프로필 설정이 필요합니다.' },
        { status: 400 },
      );
    }

    const { position, experience, skills } = profile;

    // OpenAI에 넘길 사용자 소개 텍스트 구성
    let introduction = `- 직무: ${position}`;

    if (experience !== null) {
      introduction += `\n- 경력: ${experience === 0 ? '신입' : `${experience}년차`}`;
    }

    if (skills.length > 0) {
      introduction += `\n- 기술 스택: ${skills.join(', ')}`;
    }

    if (prevQuestions.length > 0) {
      introduction += `\n\n- 이미 받은 질문 목록:`;
      introduction += prevQuestions
        .map((q, idx) => `\n${idx + 1}. ${q.content}`)
        .join('');
    }

    // 면접 질문 생성 요청
    let response = await createQuestionResponse({
      introduction,
      maxTokens: 800,
    });

    if (response.status === 'incomplete') {
      console.error('OpenAI response incomplete (1st try)', {
        incomplete_details: response.incomplete_details,
      });

      response = await createQuestionResponse({
        introduction,
        maxTokens: 1400,
      });
    }

    // 2차도 incomplete면 실패 처리
    if (response.status === 'incomplete') {
      console.error('OpenAI response incomplete (2nd try)', {
        incomplete_details: response.incomplete_details,
      });

      return NextResponse.json(
        { error: '면접 질문 생성에 실패했습니다. (응답이 잘렸습니다)' },
        { status: 500 },
      );
    }

    const raw = response.output_text;

    // OpenAI 응답에 output_text가 있는지 확인
    if (!raw) {
      console.error('OpenAI 응답에 output_text가 없습니다.', response);

      return NextResponse.json(
        { error: '면접 질문 생성에 실패했습니다.' },
        { status: 500 },
      );
    }

    let parsed: Partial<GeneratedQuestion>;

    try {
      // JSON 파싱
      parsed = JSON.parse(raw) as GeneratedQuestion;
    } catch (err) {
      console.error('Failed to parse OpenAI response as JSON', {
        raw,
        err,
      });

      return NextResponse.json(
        { error: '면접 질문 생성에 실패했습니다.' },
        { status: 500 },
      );
    }

    const { content, idealAnswer, tags } = parsed;

    // content / idealAnswer / tags 필드 유효성 검사
    if (
      typeof content !== 'string' ||
      typeof idealAnswer !== 'string' ||
      !Array.isArray(tags) ||
      tags.length === 0 ||
      !tags.every((tag) => typeof tag === 'string')
    ) {
      console.error('Invalid generated question format', parsed);

      return NextResponse.json(
        { error: '생성된 응답 형식이 올바르지 않습니다.' },
        { status: 500 },
      );
    }

    // 태그 정규화 (trim + 소문자 + 5개까지 제한)
    const normalizedTags = tags
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0)
      .slice(0, 5);

    if (normalizedTags.length === 0) {
      return NextResponse.json(
        { error: '생성된 태그가 올바르지 않습니다.' },
        { status: 500 },
      );
    }

    // 생성된 질문을 DB에 저장
    const { _id } = await QuestionModel.create({
      userId,
      content,
      idealAnswer,
      tags: normalizedTags,
    });

    const questionId = _id.toString();

    // 생성된 questionId를 응답으로 반환
    return NextResponse.json({ questionId }, { status: 201 });
  } catch (err) {
    console.error('POST /api/questions unexpected error', err);

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 },
    );
  }
}
