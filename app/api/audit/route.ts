import { NextRequest, NextResponse } from "next/server"

// Simulated AI analysis - in production this would call your FastAPI backend
async function analyzeAudio(audioUrl: string): Promise<{
  healthScore: number
  overallCondition: "excellent" | "good" | "fair" | "poor" | "critical"
  findings: Array<{
    type: "positive" | "warning" | "critical"
    category: string
    title: string
    description: string
    confidence: number
  }>
}> {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Generate realistic analysis results
  const healthScore = Math.floor(Math.random() * 30) + 70 // 70-100

  let overallCondition: "excellent" | "good" | "fair" | "poor" | "critical"
  if (healthScore >= 90) overallCondition = "excellent"
  else if (healthScore >= 80) overallCondition = "good"
  else if (healthScore >= 70) overallCondition = "fair"
  else if (healthScore >= 50) overallCondition = "poor"
  else overallCondition = "critical"

  const possibleFindings = [
    {
      type: "positive" as const,
      category: "Engine",
      title: "Smooth Idle",
      description: "Engine maintains consistent idle RPM with minimal variation",
      confidence: 0.92,
    },
    {
      type: "positive" as const,
      category: "Timing",
      title: "Proper Timing",
      description: "No misfires or timing irregularities detected in the audio signature",
      confidence: 0.88,
    },
    {
      type: "warning" as const,
      category: "Belt",
      title: "Minor Belt Noise",
      description: "Slight squeaking detected, may indicate belt wear. Recommend inspection.",
      confidence: 0.75,
    },
    {
      type: "positive" as const,
      category: "Exhaust",
      title: "Normal Exhaust Sound",
      description: "Exhaust tone is consistent with a healthy catalytic converter",
      confidence: 0.85,
    },
    {
      type: "warning" as const,
      category: "Valvetrain",
      title: "Light Valve Tick",
      description: "Minor ticking noise detected, common in high-mileage engines",
      confidence: 0.70,
    },
  ]

  // Select 2-4 random findings
  const numFindings = Math.floor(Math.random() * 3) + 2
  const shuffled = possibleFindings.sort(() => 0.5 - Math.random())
  const findings = shuffled.slice(0, numFindings)

  console.log("[v0] Audio analysis complete:", { audioUrl, healthScore, findingsCount: findings.length })

  return {
    healthScore,
    overallCondition,
    findings,
  }
}

// Generate AI summary using OpenAI (or simulated)
async function generateAISummary(
  vehicle: { make: string; model: string; year: number },
  analysis: { healthScore: number; overallCondition: string },
  listing?: { claimedMileage: number; askingPrice: number }
): Promise<string> {
  // Check if OpenAI API key is available
  const openaiKey = process.env.OPENAI_API_KEY

  if (openaiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an expert automotive analyst. Provide a brief, professional summary of a vehicle audit in 2-3 sentences.",
            },
            {
              role: "user",
              content: `Summarize this vehicle audit:
              Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}
              Engine Health Score: ${analysis.healthScore}/100 (${analysis.overallCondition})
              ${listing ? `Claimed Mileage: ${listing.claimedMileage.toLocaleString()} miles` : ""}
              ${listing ? `Asking Price: $${listing.askingPrice.toLocaleString()}` : ""}`,
            },
          ],
          max_tokens: 150,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.choices[0].message.content
      }
    } catch (error) {
      console.error("OpenAI API error:", error)
    }
  }

  // Fallback to generated summary
  const condition = analysis.overallCondition
  const score = analysis.healthScore

  if (score >= 85) {
    return `This ${vehicle.year} ${vehicle.make} ${vehicle.model} shows excellent engine health with a score of ${score}/100. Our AI analysis detected no major concerns, making this a promising purchase candidate.`
  } else if (score >= 70) {
    return `This ${vehicle.year} ${vehicle.make} ${vehicle.model} scores ${score}/100 for engine health, indicating ${condition} condition. Minor maintenance items were identified but nothing that should prevent purchase with proper negotiation.`
  } else {
    return `This ${vehicle.year} ${vehicle.make} ${vehicle.model} shows a health score of ${score}/100, indicating ${condition} condition. We recommend a professional inspection before proceeding with this purchase.`
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case "analyze": {
        const { audioUrl } = data
        if (!audioUrl) {
          return NextResponse.json({ error: "Audio URL is required" }, { status: 400 })
        }
        const analysis = await analyzeAudio(audioUrl)
        return NextResponse.json(analysis)
      }

      case "generate-summary": {
        const { vehicle, analysis, listing } = data
        if (!vehicle || !analysis) {
          return NextResponse.json({ error: "Vehicle and analysis data required" }, { status: 400 })
        }
        const summary = await generateAISummary(vehicle, analysis, listing)
        return NextResponse.json({ summary })
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Audit API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
