import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface VinDecodeResult {
  make: string;
  model: string;
  year: number;
  engine: string;
  transmission: string;
  fuelType: string;
  bodyStyle: string;
  drivetrain: string;
  confidence: number;
}

export interface MaintenanceRecommendation {
  task: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  estimatedCost: string;
  dueDate: string;
  reason: string;
}

export async function decodeVIN(vin: string): Promise<VinDecodeResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert automotive VIN decoder. Decode the provided VIN number and extract detailed vehicle information. 
          Respond with JSON in this exact format: {
            "make": "string",
            "model": "string", 
            "year": number,
            "engine": "string",
            "transmission": "string",
            "fuelType": "string",
            "bodyStyle": "string",
            "drivetrain": "string",
            "confidence": number (0-1)
          }
          Be as accurate as possible. If you cannot determine a field with high confidence, use "Unknown" for strings and 0 for numbers.`
        },
        {
          role: "user",
          content: `Decode this VIN: ${vin}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      make: result.make || 'Unknown',
      model: result.model || 'Unknown',
      year: result.year || 0,
      engine: result.engine || 'Unknown',
      transmission: result.transmission || 'Unknown',
      fuelType: result.fuelType || 'Unknown',
      bodyStyle: result.bodyStyle || 'Unknown',
      drivetrain: result.drivetrain || 'Unknown',
      confidence: Math.max(0, Math.min(1, result.confidence || 0))
    };
  } catch (error) {
    console.error("VIN decode error:", error);
    throw new Error("Failed to decode VIN with AI");
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