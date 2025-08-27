import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


export interface MaintenanceRecommendation {
  task: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  estimatedCost: string;
  dueDate: string;
  reason: string;
}

export interface VehicleInsights {
  funFacts: string[];
  marketValue: {
    estimated: string;
    factors: string[];
  };
  performance: {
    acceleration: string;
    topSpeed: string;
    mpg: string;
  };
  reliability: {
    score: string;
    commonIssues: string[];
    strongPoints: string[];
  };
  maintenance: {
    annualCost: string;
    criticalServices: string[];
    tips: string[];
  };
  modifications: {
    popular: string[];
    recommendations: string[];
  };
  trivia: {
    productionNumbers: string;
    celebrities: string[];
    historical: string[];
  };
}

export async function enhanceVehicleData(vehicleData: {
  make: string;
  model: string;
  modelYear: number;
  trim?: string;
  engine?: string;
  mileage?: number;
}): Promise<VehicleInsights> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an automotive expert analyst. Provide comprehensive insights about the given vehicle.
          Respond with JSON in this exact format: {
            "funFacts": ["array of 3-5 interesting facts"],
            "marketValue": {
              "estimated": "price range like '$15,000-25,000'",
              "factors": ["factors affecting value"]
            },
            "performance": {
              "acceleration": "0-60 time or description",
              "topSpeed": "top speed",
              "mpg": "fuel economy"
            },
            "reliability": {
              "score": "rating like '8/10' or 'Above Average'",
              "commonIssues": ["known problems"],
              "strongPoints": ["reliable aspects"]
            },
            "maintenance": {
              "annualCost": "estimated yearly cost",
              "criticalServices": ["important maintenance items"],
              "tips": ["maintenance advice"]
            },
            "modifications": {
              "popular": ["common modifications"],
              "recommendations": ["suggested upgrades"]
            },
            "trivia": {
              "productionNumbers": "how many made",
              "celebrities": ["famous owners if any"],
              "historical": ["historical significance"]
            }
          }
          Be informative and engaging. If unsure about specifics, provide reasonable estimates based on the vehicle type.`
        },
        {
          role: "user",
          content: `Analyze this vehicle:
          ${vehicleData.modelYear} ${vehicleData.make} ${vehicleData.model}
          ${vehicleData.trim ? `Trim: ${vehicleData.trim}` : ''}
          ${vehicleData.engine ? `Engine: ${vehicleData.engine}` : ''}
          ${vehicleData.mileage ? `Mileage: ${vehicleData.mileage} miles` : ''}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      funFacts: result.funFacts || [],
      marketValue: result.marketValue || { estimated: "Unknown", factors: [] },
      performance: result.performance || { acceleration: "Unknown", topSpeed: "Unknown", mpg: "Unknown" },
      reliability: result.reliability || { score: "Unknown", commonIssues: [], strongPoints: [] },
      maintenance: result.maintenance || { annualCost: "Unknown", criticalServices: [], tips: [] },
      modifications: result.modifications || { popular: [], recommendations: [] },
      trivia: result.trivia || { productionNumbers: "Unknown", celebrities: [], historical: [] }
    };
  } catch (error) {
    console.error("Vehicle enhancement error:", error);
    throw new Error("Failed to enhance vehicle data with AI");
  }
}

export async function generateMaintenanceRecommendations(
  vehicleData: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    modifications?: string[];
    lastMaintenance?: string[];
  }
): Promise<MaintenanceRecommendation[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an expert automotive maintenance advisor. Generate personalized maintenance recommendations based on vehicle data.
          Respond with JSON array of recommendations in this format: [{
            "task": "string",
            "priority": "low|medium|high|urgent",
            "description": "string",
            "estimatedCost": "string like '$50-100'",
            "dueDate": "string like 'Next 1000 miles' or 'Within 30 days'",
            "reason": "string explaining why this is needed"
          }]
          Focus on preventive maintenance, safety, and performance optimization.`
        },
        {
          role: "user",
          content: `Generate maintenance recommendations for:
          Vehicle: ${vehicleData.year} ${vehicleData.make} ${vehicleData.model}
          Mileage: ${vehicleData.mileage} miles
          Modifications: ${vehicleData.modifications?.join(', ') || 'None'}
          Recent Maintenance: ${vehicleData.lastMaintenance?.join(', ') || 'None recorded'}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
    return result.recommendations || [];
  } catch (error) {
    console.error("Maintenance recommendations error:", error);
    throw new Error("Failed to generate maintenance recommendations");
  }
}

export async function analyzeModificationPhoto(base64Image: string): Promise<{
  category: string;
  description: string;
  suggestedTags: string[];
  estimatedValue: string;
  confidence: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an expert automotive modification analyzer. Analyze the provided image and identify the automotive modification or part shown.
          Respond with JSON in this format: {
            "category": "string (e.g., 'Exhaust', 'Suspension', 'Engine', 'Wheels', 'Interior', 'Exterior')",
            "description": "string describing what you see",
            "suggestedTags": ["array", "of", "relevant", "tags"],
            "estimatedValue": "string like '$200-500'",
            "confidence": number (0-1)
          }`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this automotive modification photo and provide detailed information."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 500
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      category: result.category || 'Unknown',
      description: result.description || 'Unable to analyze image',
      suggestedTags: result.suggestedTags || [],
      estimatedValue: result.estimatedValue || 'Unknown',
      confidence: Math.max(0, Math.min(1, result.confidence || 0))
    };
  } catch (error) {
    console.error("Photo analysis error:", error);
    throw new Error("Failed to analyze modification photo");
  }
}

export async function smartCategorizeEntry(
  title: string,
  description: string,
  cost: number
): Promise<{
  category: string;
  subcategory: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  suggestedNextSteps: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an expert automotive entry categorizer. Analyze the provided modification or maintenance entry and categorize it intelligently.
          Respond with JSON in this format: {
            "category": "string (Maintenance, Performance, Aesthetic, Safety, etc.)",
            "subcategory": "string (more specific category)",
            "tags": ["array", "of", "relevant", "tags"],
            "priority": "low|medium|high",
            "suggestedNextSteps": ["array", "of", "suggested", "follow-up", "actions"]
          }`
        },
        {
          role: "user",
          content: `Categorize this automotive entry:
          Title: ${title}
          Description: ${description}
          Cost: $${cost}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      category: result.category || 'General',
      subcategory: result.subcategory || 'Miscellaneous',
      tags: result.tags || [],
      priority: result.priority || 'medium',
      suggestedNextSteps: result.suggestedNextSteps || []
    };
  } catch (error) {
    console.error("Smart categorization error:", error);
    throw new Error("Failed to categorize entry with AI");
  }
}

// Get factory engine name from manufacturer sources and forums
export async function getEngineFactoryName(vehicleData: {
  make: string;
  model: string;
  modelYear: number;
  trim?: string;
  engine?: string;
}): Promise<{
  factoryEngineName: string;
  engineCode: string;
  confidence: string;
  sources: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an automotive technical expert with access to manufacturer specifications, service manuals, and automotive forums. Your task is to find the exact factory engine name and engine code as specified by the manufacturer.

          Search through your knowledge of:
          - Official manufacturer service manuals and specifications
          - Automotive enthusiast forums (BMW forums, Audi forums, etc.)
          - Technical databases and VIN decoding resources
          - Performance enthusiast communities
          - Manufacturer press releases and technical documentation

          Respond with JSON in this exact format: {
            "factoryEngineName": "Official engine name/code from manufacturer (e.g., 'S58', 'EA888', 'LS3')",
            "engineCode": "Internal engine code if different from name",
            "confidence": "High|Medium|Low based on source reliability",
            "sources": ["List of source types consulted (e.g., 'BMW Service Manual', 'M3 Forum Technical Database')"]
          }

          Be precise and only return verified information from reliable sources.`
        },
        {
          role: "user",
          content: `Find the factory engine name and code for:
          ${vehicleData.modelYear} ${vehicleData.make} ${vehicleData.model}
          ${vehicleData.trim ? `Trim: ${vehicleData.trim}` : ''}
          ${vehicleData.engine ? `Current engine spec: ${vehicleData.engine}` : ''}
          
          Search manufacturer documentation, service manuals, and enthusiast forums for the exact factory engine designation.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      factoryEngineName: result.factoryEngineName || 'Unknown',
      engineCode: result.engineCode || '',
      confidence: result.confidence || 'Low',
      sources: result.sources || []
    };
  } catch (error) {
    console.error("Engine name lookup error:", error);
    throw new Error("Failed to lookup factory engine name");
  }
}

// Get comprehensive reliability score from critics and online reviews
export async function getReliabilityScore(vehicleData: {
  make: string;
  model: string;
  modelYear: number;
  trim?: string;
}): Promise<{
  overallScore: string;
  scoreOutOf10: number;
  criticsConsensus: string;
  strengthAreas: string[];
  weaknessAreas: string[];
  recommendedForBuying: boolean;
  sources: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an automotive reliability analyst with access to comprehensive review data from major automotive critics, consumer reports, and owner feedback databases.

          Analyze reliability based on data from:
          - Consumer Reports reliability ratings
          - J.D. Power quality studies
          - Automotive journalist long-term reviews (Car and Driver, Motor Trend, etc.)
          - Owner forums and complaint databases
          - NHTSA reliability data
          - Manufacturer recall information
          - Independent mechanic feedback

          Respond with JSON in this exact format: {
            "overallScore": "Descriptive rating (e.g., 'Above Average', 'Excellent', 'Poor')",
            "scoreOutOf10": number from 1-10,
            "criticsConsensus": "Summary of what automotive critics generally say",
            "strengthAreas": ["List of reliable components/systems"],
            "weaknessAreas": ["List of problematic areas"],
            "recommendedForBuying": boolean,
            "sources": ["Types of sources analyzed"]
          }

          Base ratings on actual critic reviews and owner experiences, not general assumptions.`
        },
        {
          role: "user",
          content: `Analyze the reliability score for:
          ${vehicleData.modelYear} ${vehicleData.make} ${vehicleData.model}
          ${vehicleData.trim ? `Trim: ${vehicleData.trim}` : ''}
          
          Provide a comprehensive reliability assessment based on automotive critics, consumer reports, and real owner experiences.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      overallScore: result.overallScore || 'Unknown',
      scoreOutOf10: result.scoreOutOf10 || 5,
      criticsConsensus: result.criticsConsensus || 'No consensus available',
      strengthAreas: result.strengthAreas || [],
      weaknessAreas: result.weaknessAreas || [],
      recommendedForBuying: result.recommendedForBuying || false,
      sources: result.sources || []
    };
  } catch (error) {
    console.error("Reliability score error:", error);
    throw new Error("Failed to analyze reliability score");
  }
}