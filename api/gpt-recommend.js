module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 요청만 허용됩니다." });
  }

  const { style } = req.body;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "API 키 없음" });
  }

  const prompts = {
    soft: "부드럽고 따뜻한 인상의 한국 이름 10개를 뜻과 함께 추천해줘.",
    strong: "강하고 힘있는 인상의 한국 이름 10개를 뜻과 함께 추천해줘.",
    classic: "전통적인 한자 기반의 한국 이름 10개를 뜻과 함께 추천해줘.",
    popular: "최근 한국에서 인기 있는 이름 10개와 각각의 의미를 알려줘.",
    nature: "자연(하늘, 바다, 숲, 별 등)에서 영감을 받은 이름 10개를 의미와 함께 추천해줘.",
    pureKorean: "순우리말 이름 10개를 추천하고 각각의 뜻도 함께 설명해줘."
  };

  const prompt = prompts[style];
  if (!prompt) {
    return res.status(400).json({ error: "잘못된 스타일" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "당신은 이름 작명 전문가입니다." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const json = await response.json();
    const raw = json.choices?.[0]?.message?.content || "";

    const lines = raw
      .split("\n")
      .map(line => line.replace(/^\d+\.\s*|^-+\s*/, '').trim())
      .filter(line => line.length > 0);

    return res.status(200).json({ names: lines });

  } catch (error) {
    console.error("GPT 추천 실패:", error);
    return res.status(500).json({ error: "GPT 추천 실패" });
  }
};
