import { NextRequest, NextResponse } from "next/server"

interface NHTSAResult {
  Variable: string
  Value: string | null
}

interface NHTSAResponse {
  Results: NHTSAResult[]
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const vin = searchParams.get("vin")

  if (!vin) {
    return NextResponse.json({ error: "VIN is required" }, { status: 400 })
  }

  // Validate VIN format (17 characters, alphanumeric except I, O, Q)
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i
  if (!vinRegex.test(vin)) {
    return NextResponse.json({ error: "Invalid VIN format" }, { status: 400 })
  }

  try {
    // Call NHTSA API to decode VIN
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
    )

    if (!response.ok) {
      throw new Error("Failed to decode VIN")
    }

    const data: NHTSAResponse = await response.json()

    // Extract relevant fields from NHTSA response
    const getValue = (variableName: string): string | null => {
      const result = data.Results.find((r) => r.Variable === variableName)
      return result?.Value || null
    }

    const vehicleInfo = {
      vin: vin.toUpperCase(),
      make: getValue("Make"),
      model: getValue("Model"),
      year: parseInt(getValue("Model Year") || "0") || null,
      trim: getValue("Trim"),
      bodyClass: getValue("Body Class"),
      driveType: getValue("Drive Type"),
      fuelType: getValue("Fuel Type - Primary"),
      engineCylinders: parseInt(getValue("Engine Number of Cylinders") || "0") || null,
      engineDisplacement: getValue("Displacement (L)"),
      transmissionStyle: getValue("Transmission Style"),
      manufacturer: getValue("Manufacturer Name"),
      plantCountry: getValue("Plant Country"),
      vehicleType: getValue("Vehicle Type"),
    }

    // Check if we got valid data
    if (!vehicleInfo.make || !vehicleInfo.model) {
      return NextResponse.json(
        { error: "Could not decode VIN. Please check the VIN and try again." },
        { status: 400 }
      )
    }

    return NextResponse.json(vehicleInfo)
  } catch (error) {
    console.error("VIN decode error:", error)
    return NextResponse.json(
      { error: "Failed to decode VIN. Please try again." },
      { status: 500 }
    )
  }
}
