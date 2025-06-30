module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 요청만 허용됩니다." });
  }

  const { name } = req.body;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "API 키 없음" });
  }

  const isPureKorean = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/.test(name) && name.length === 2;

  const prompt = isPureKorean
    ? `\uac00\uc9c0 \uc804\uc5d0 \uc785\ub825\ub41c \ud55c\uad6d\uc5b4 \uc774\ub984\uc740 \uc21c\uc6b0\ub9ac\ub9d0\uc785\ub2c8\ub2e4. \ubc18\ubcf5\ub418\uc9c0 \uc54a\ub3c4\ub85d \ub2e4\ub978 2\uac1c\uc758 \uc21c\uc6b0\ub9ac\ub9d0 \uc774\ub984\uacfc \uac01\uac01\uc758 \ub2e8\uac00\ub85c \uae30억\ud560 \uc218 \uc788는 \uc758\ubbf8\ub97c \uc124명\ud574주세요. \ub2e8, \ud55c자\ub294 \uc81c거\ud574주세요.\n\uc608: \ub098\ub798 - \ub0a0개를 \ub73b하는 \uc21c\uc6b0\ub9ac\ub9d0`
    : `\uac00\uc9c0 \uc804\uc5d0 \uc785\ub825\ub41c \ud55c\uad6d\uc5b4 \uc774\ub984\uc740 \ud55c자\uac00 \ud3ec함된 \ub450 \uae00자\ub85c \uad6c성됩니다. \ub2e4\uc74c\uacfc 같이 \ucd5c적 2\uac1c\uc758 \uc774\ub984을 \uc758\ubbf8\uc640 \ud55c자 \ud3ec함으로 \uc124명\ud574주세요.\n\uc608: \ud0dc윤 - \ud06c고 \ubc1d은 빛처럼 \uc131장하기를 바랍는 \uc774\ub984 (\ud0dc: \ud06c다, \uc724: \ud574아른 빛)`;

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
          { role: "system", content: "이름 찾기 전문가입니다." },
          { role: "user", content: prompt.replace(/\n/g, " ") + `\n\uc785\ub825된 \uc774\ub984: ${name}` }
        ],
        temperature: 0.7
      })
    });

    const json = await response.json();
    const answer = json.choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error("GPT 응답 없음");

    return res.status(200).json({ meaning: answer });
  } catch (error) {
    console.error("GPT 호출 실패:", error);
    return res.status(500).json({ error: "GPT 호출 실패" });
  }
};
