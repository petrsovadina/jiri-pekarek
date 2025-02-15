import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt, context, apiKey } = await req.json()

    if (!apiKey) {
      return NextResponse.json(
        { error: "API klíč není nastaven" },
        { status: 400 }
      )
    }

    const formattedPrompt = `
      Použij následující kontext k vygenerování odpovědi na základě zadaného promptu:
      
      Kontext:
      ${Object.entries(context)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n")}
      
      Prompt: ${prompt}
      
      Vygenerovaná odpověď:
    `

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-2",
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: formattedPrompt
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.error?.message || "API request failed" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ text: data.content[0].text })
  } catch (error) {
    console.error("Error generating content:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}