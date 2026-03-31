export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const body = await req.json();
  const { title, team, dept, empType, resp, reqText } = body;

  const prompt = `당신은 GC케어/GC메디아이의 채용 전문가입니다. 아래 정보를 바탕으로 전문적이고 매력적인 직무기술서(JD)를 한국어로 작성해주세요.

직무명: ${title || ''}
소속 팀: ${team || ''}
부서: ${dept || ''}
고용형태: ${empType || '정규직'}
주요 담당 업무:
${resp || '(미입력)'}
자격 요건:
${reqText || '(미입력)'}

아래 형식을 그대로 사용해서 작성해주세요. 각 섹션 내용은 실제 직무에 맞게 구체적으로 채워주세요:

[${empType || '정규직'}] ${title || ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▎ 팀 소개
(${team || '팀'} 소개와 함께 일하게 될 동료에 대해 2-3문장으로 작성)

▎ 이런 일을 합니다
(주요 담당 업무를 bullet point로 구체적으로 작성, 5-7개)

▎ 이런 분을 찾습니다
(필수 자격 요건을 bullet point로 작성, 4-6개)

▎ 우대 사항
(우대 조건을 bullet point로 작성, 3-5개)

▎ 근무 조건
  • 고용 형태: ${empType || '정규직'}
  • 근무지: 경기도 용인시 (GC녹십자 본사)
  • 복리후생: 4대 보험, 연차, 경조사 지원, 사내 식당

▎ 지원 방법
   채웄 접수 후 개별 안내 드립니다.
  서류 접수 후 개별 안내 드립니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        })
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error('No response from Gemini');

    return new Response(JSON.stringify({ jd: text }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(
      JSON.stringify({ error: '생성에 실패했습니다. 잠시 후 다시 시도해주세요.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
