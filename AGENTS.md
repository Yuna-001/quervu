<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 프로젝트 작업 규칙

### 커밋 컨벤션

커밋 메시지를 작성할 때는 아래 타입을 사용한다.

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `refactor`: 리팩토링
- `style`: CSS, Tailwind 클래스 등 사용자 UI 디자인 변경
- `comment`: 코드 주석 추가 및 변경
- `test`: 테스트 코드 추가, 수정, 삭제 등 비즈니스 로직에 변경이 없는 경우
- `chore`: 위 타입에 해당하지 않는 기타 변경사항  
  예: 빌드 스크립트 수정, 이미지 에셋 변경, 패키지 매니저 관련 변경
- `rename`: 파일 또는 폴더명을 수정하거나 옮기는 경우
- `remove`: 코드나 파일을 삭제하는 작업만 수행하는 경우
- `docs`: 문서 수정

커밋 메시지는 아래 형식을 따른다.

```text
type: 변경 내용 요약

- 세부 변경 사항
- 세부 변경 사항
```

커밋 타입은 영어 키워드를 사용하고, 제목과 본문 설명은 한글로 작성한다.
제목과 본문의 문장은 가능한 한 명사형으로 끝낸다.
본문은 변경 사항이 여러 개이거나 의도를 설명할 필요가 있을 때 작성한다.
필요하다면 작업 단위에 따라 커밋을 여러 개로 나눈다.

예시:

```text
fix: 정적 이미지 요청 프록시 제외

- 헤더 로고를 public 정적 경로로 참조하도록 변경
- 확장자가 있는 정적 파일 요청이 인증 프록시를 타지 않도록 matcher 수정
```
