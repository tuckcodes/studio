'use server';

import { getSecurityRecommendations, type SecurityRecommendationsInput } from '@/ai/flows/security-recommendations';

export async function generateSecurityRecommendations(input: SecurityRecommendationsInput): Promise<{ success: boolean; recommendations?: string; error?: string; }> {
  try {
    if (!input.environmentDescription.trim()) {
        return { success: false, error: "Environment description cannot be empty." };
    }
    const result = await getSecurityRecommendations(input);
    return { success: true, recommendations: result.recommendations };
  } catch (error) {
    console.error("Error generating security recommendations:", error);
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred.' };
  }
}
