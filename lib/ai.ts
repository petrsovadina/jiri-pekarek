const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

async function retry<T>(fn: () => Promise<T>, retries: number = MAX_RETRIES): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) throw error
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
    return retry(fn, retries - 1)
  }
}

export async function generateAIContent(prompt: string, context: Record<string, string>) {
  const apiKey = typeof window !== 'undefined' ? localStorage.getItem("anthropic_api_key") : null
  if (!apiKey) {
    throw new Error("Anthropic API klíč není nastaven. Prosím nastavte jej v nastavení účtu.")
  }

  try {
    console.log("Volám AI API s promptem:", prompt)
    
    const response = await retry(async () => {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          context,
          apiKey
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "API request failed")
      }

      return res.json()
    })

    if (!response.text) {
      throw new Error("Prázdná odpověď od AI")
    }

    console.log("Odpověď od AI:", response.text)
    return response.text.trim()
  } catch (error) {
    console.error("Chyba při generování obsahu pomocí AI:", error)

    let errorMessage = "Neznámá chyba při generování obsahu"
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === "object" && error !== null) {
      errorMessage = JSON.stringify(error)
    }

    throw new Error(`Chyba AI: ${errorMessage}`)
  }
}
