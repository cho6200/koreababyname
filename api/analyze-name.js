export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 요청만 허용됩니다." });
  }

  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "이름을 입력해주세요." });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;  // 🔐 환경변수에서 불러오기

  const systemPrompt = `입력된 이름의 의미를 한글로 설명해줘. 이름은 한국어 이름이며, 부드럽고 따뜻한 어감으로 1~2문장으로 설명해줘. 예: 우주 → 광활한 공간을 뜻하며 자유롭고 확장적인 느낌을 줍니다.`;

  const userPrompt = `이름: ${name}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}` // ✅ 키 노출 없이 사용
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    const json = await response.json();

    if (!json.choices || !json.choices[0]) {
      return res.status(500).json({ error: "GPT 응답 오류" });
    }

    const answer = json.choices[0].message.content.trim();
    return res.status(200).json({ meaning: answer });

  } catch (error) {
    console.error("GPT 호출 실패:", error);
    return res.status(500).json({ error: "서버 오류: GPT 호출 실패" });
