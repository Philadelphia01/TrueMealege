export interface User {
  uid: string
  email: string
  displayName: string | null
  photoURL: string | null
  createdAt: Date
}

export interface VehicleInfo {
  vin: string
  make: string
  model: string
  year: number
  trim?: string
  bodyClass?: string
  driveType?: string
  fuelType?: string
  engineCylinders?: number
  engineDisplacement?: string
  transmissionStyle?: string
}

export interface AudioAnalysis {
  healthScore: number
  overallCondition: "excellent" | "good" | "fair" | "poor" | "critical"
  findings: AnalysisFinding[]
  spectralFeatures: {
    meanFrequency: number
    peakFrequency: number
    spectralCentroid: number
  }
  engineSoundProfile: {
    idleRPM: number
    stability: number
    noiseLevel: string
  }
  rawData?: {
    mfccs: number[]
    zeroCrossingRate: number
    rmsEnergy: number
  }
}

export interface AnalysisFinding {
  type: "positive" | "warning" | "critical"
  category: string
  title: string
  description: string
  confidence: number
}

export interface ListingVerification {
  claimedMileage: number
  askingPrice: number
  sellerType: "private" | "dealer"
  sellerName?: string
  listingUrl?: string
  listingPlatform?: string
  verificationResults: {
    mileageConsistency: "consistent" | "suspicious" | "inconsistent"
    priceAssessment: "fair" | "above_market" | "below_market" | "suspicious"
    flags: string[]
    recommendations: string[]
  }
}

export interface Audit {
  id: string
  userId: string
  status: "in_progress" | "completed" | "cancelled"
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  
  // Step 1: Vehicle Info
  vehicle?: VehicleInfo
  
  // Step 2: Audio Recording
  audioUrl?: string
  audioDuration?: number
  recordedAt?: Date
  
  // Step 3: Analysis
  analysis?: AudioAnalysis
  analyzedAt?: Date
  
  // Step 4: Listing Verification
  listing?: ListingVerification
  verifiedAt?: Date
  
  // Final Report
  reportGenerated?: boolean
  reportUrl?: string
  aiSummary?: string
}

export interface AuditStep {
  id: "vin" | "recording" | "analysis" | "listing" | "report"
  title: string
  description: string
  completed: boolean
  current: boolean
}

export const AUDIT_STEPS: Omit<AuditStep, "completed" | "current">[] = [
  { id: "vin", title: "Enter VIN", description: "Enter or scan the vehicle identification number" },
  { id: "recording", title: "Record Engine", description: "Capture the engine sound for analysis" },
  { id: "analysis", title: "AI Analysis", description: "AI analyzes the engine health" },
  { id: "listing", title: "Verify Listing", description: "Compare against seller claims" },
  { id: "report", title: "View Report", description: "Get your comprehensive report" },
]
