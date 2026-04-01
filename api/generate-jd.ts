export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const { title, team, dept, teamIntro, empType, resp, reqText, prefText, notFit } = body;

    if (!title) {
      return new Response(JSON.stringify({ error: '직무명은 필수입니다.' }), { status: 400 });
    }

    const prompt = `당신은 채용 전문가입니다. 아래 정보를 바탕으로 한국어 직무기술서(JD) 초안을 작성해주세요.

[입력 정보]
- 직무명: ${title}
- 팀: ${team || '미기재'}
- 부서: ${dept || '미기재'}
${teamIntro ? `- 팀 소개: ${teamIntro}` : ''}
- 고용 형태: ${empType || '정규직'}
${resp ? `- 주요 담당 업무:\n${resp}` : ''}
${reqText ? `- 자격 요건:\n${reqText}` : ''}
${prefText ? `- 우대사항:\n${prefText}` : ''}
${notFit ? `- 이런 분은 우리와 맞지 않습니다:\n${notFit}` : ''}

[작성 지침]
1. 아래 구조로 작성하세요 (입력된 항목만 포함):
   - 포지션 소개 (2~3문장)
   ${teamIntro ? '- 팀 소개 (입력된 내용 기반으로 자연스럽게 보완)' : ''}
   - 주요 업무 (bullet point)
   - 자격 요건 (bullet point)
   ${prefText ? '- 우대사항 (bullet point)' : ''}
   ${notFit ? '- 이런 분은 우리와 맞지 않습니다 (bullet point)' : ''}
   - 근무 조건 (고용형태 기반, 1~2줄)
2. 과장되거나 추상적인 표현은 피하고, 실질적이고 명확하게 작성하세요.
3. 지원자 입장에서 읽기 쉽도록 자연스러운 한국어로 작성하세요.
4. 마크다운 기호(**, ##)는 사용하지 말고, 일반 텍스트로 작성하세요.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', errText);
      return new Response(JSON.stringify({ error: 'AI 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }), { status: 500 });
    }

    const data = await response.json();
    const jd = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!jd) {
      return new Response(JSON.stringify({ error: 'JD 생성에 실패했습니다. 다시 시도해주세요.' }), { status: 500 });
    }

    return new Response(JSON.stringify({ jd }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Handler error:', err);
    return new Response(JSON.stringify({ error: '서버 오류가 발생했습니다.' }), { status: 500 });
  }
}