import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
      model: "gpt-4o",
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
      model: "gpt-4o",
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
      model: "gpt-4o",
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
      model: "gpt-4o",
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