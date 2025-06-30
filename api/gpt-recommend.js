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
    soft: "한국에서 실제로 사용되는 부드러운 두 글자짜리 이름 10개를 추천해줘. 영어는 포함하지 말고, 각 이름의 의미와 함께 한자도 같이 알려줘. 예: 태윤 – 크고 밝은 빛처럼 성장하길 바라는 이름 (太: 클 태, 昀: 햇빛 윤)",
    strong: "강한 인상의 한국 두 글자 이름 10개를 추천해줘. 영어 없이, 의미와 함께 한자도 같이 알려줘.",
    classic: "전통적인 한국식 한자 이름 10개를 추천해줘. 이름은 반드시 두 글자이며, 한자 각각의 뜻도 설명해줘.",
    popular: "최근 인기 있는 두 글자 한국 이름 10개를 추천해줘. 각 이름의 의미와 한자도 같이 알려줘.",
    nature: "자연에서 영감을 받은 두 글자 이름 10개를 추천해줘. 예: 하늘, 바다 등. 영어 없이 이름 + 뜻 + 한자를 같이 알려줘.",
    pureKorean: "순우리말 기반 두 글자 이름 10개를 추천해줘. 이름은 반드시 순우리말이며, 한자는 생략하고 의미만 간단히 알려줘."
  };

  const prompt = prompts[style];
  if (!prompt) {
    return res.status(400).json({ error: "잘못된 스타일 요청입니다." });
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
          { role: "system", content: "이름 작명 전문가로써 사용자에게 맞춤형 한국 이름을 추천합니다." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const json = await response.json();
    const raw = json.choices?.[0]?.message?.content || "";

    const lines = raw
      .split("\n")
      .map(line => line.replace(/^\d+\.\s*/, "").trim())
      .filter(line => line.length > 0);

    return res.status(200).json({ names: lines });
  } catch (error) {
    console.error("GPT 추천 실패:", error);
    return res.status(500).json({ error: "GPT 추천 실패" });
  }
};
