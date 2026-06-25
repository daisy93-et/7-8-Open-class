# Daisy Speaking Chatbot - Voice Version

고2 말하기 수업용 API 기반 챗봇입니다. 학생 대화 기록은 저장하지 않습니다.

## 기능

- Scenario 1: Travel Rules Around the World
- Scenario 2: Make My Own Staycation Rules
- 마이크 버튼으로 음성 입력
- AI 답변 음성 출력
- 금지 표현 연습
  - Don't forget to ...
  - Be sure not to ...
  - Make sure not to ...
  - You are not allowed to ...
- 시나리오 1에서 OpenAI web_search 사용

## 주의

- 개인 휴대폰에서 사용하려면 HTTPS로 배포해야 합니다.
- `http://localhost:3000`은 선생님 컴퓨터에서만 열립니다.
- 휴대폰 마이크 기능은 브라우저 제한을 받습니다.
  - Android Chrome: 비교적 잘 작동
  - iPhone Safari: 음성 인식이 제한될 수 있음
- 안 될 때는 텍스트 입력으로 대체할 수 있습니다.

## 설치 방법

1. Node.js 설치
2. 이 폴더에서 터미널 실행
3. 패키지 설치

```bash
npm install
```

4. `.env.example` 파일을 복사해서 `.env`로 이름 변경
5. `.env` 파일에 API 키 입력

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
PORT=3000
```

6. 실행

```bash
npm start
```

7. 선생님 PC에서 테스트

```text
http://localhost:3000
```

## 학생 휴대폰 사용

학생 휴대폰에서 사용하려면 Render, Railway, Vercel 같은 서비스에 배포하거나 ngrok 같은 터널링 도구를 사용해야 합니다.
