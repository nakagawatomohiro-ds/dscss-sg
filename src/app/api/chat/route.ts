import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `あなたは情報セキュリティマネジメント試験の学習アシスタントです。
以下のルールに従ってください：
- 情報セキュリティマネジメント試験の範囲に関する質問に日本語で回答してください
- 回答は簡潔で分かりやすくしてください
- 必要に応じて具体例を挙げてください
- 試験対策のアドバイスも提供してください
- 関連する用語の解説も行ってください
対応分野：情報セキュリティの基礎、関連法規、セキュリティ管理、リスクマネジメント、
技術的対策、人的・組織的対策、ネットワークセキュリティ、インシデント対応、テクノロジ系基礎`;

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI機能は現在利用できません" },
        { status: 503 }
      );
    }

    const systemMessages = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (context) {
      systemMessages.push({
        role: "system",
        content: `ユーザーの学習状況: ${JSON.stringify(context)}`,
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [...systemMessages, ...messages.slice(-10)],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI error:", err);
      return NextResponse.json(
        { error: "AI応答の取得に失敗しました" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "回答を生成できませんでした";

    return NextResponse.json({ reply });
  } catch (e) {
    console.error("Chat API error:", e);
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 }
    );
  }
}
