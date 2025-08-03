// src/ai/flows/security-recommendations.ts
'use server';

/**
 * @fileOverview Provides AI-powered security hardening recommendations for a tactical edge environment.
 *
 * - getSecurityRecommendations - A function that generates security recommendations.
 * - SecurityRecommendationsInput - The input type for the getSecurityRecommendations function.
 * - SecurityRecommendationsOutput - The return type for the getSecurityRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SecurityRecommendationsInputSchema = z.object({
  environmentDescription: z
    .string()
    .describe(
      'A detailed description of the tactical edge environment, including the Vault deployment configuration, network topology, and security requirements.'
    ),
});
export type SecurityRecommendationsInput = z.infer<typeof SecurityRecommendationsInputSchema>;

const SecurityRecommendationsOutputSchema = z.object({
  recommendations: z
    .string()
    .describe(
      'A list of security hardening recommendations tailored to the provided tactical edge environment description.'
    ),
});
export type SecurityRecommendationsOutput = z.infer<typeof SecurityRecommendationsOutputSchema>;

export async function getSecurityRecommendations(
  input: SecurityRecommendationsInput
): Promise<SecurityRecommendationsOutput> {
  return securityRecommendationsFlow(input);
}

const securityRecommendationsPrompt = ai.definePrompt({
  name: 'securityRecommendationsPrompt',
  input: {schema: SecurityRecommendationsInputSchema},
  output: {schema: SecurityRecommendationsOutputSchema},
  prompt: `You are an expert security consultant specializing in HashiCorp Vault deployments in tactical edge environments.

  Based on the following description of the environment, provide a list of actionable security hardening recommendations.

  Environment Description: {{{environmentDescription}}}
  `,
});

const securityRecommendationsFlow = ai.defineFlow(
  {
    name: 'securityRecommendationsFlow',
    inputSchema: SecurityRecommendationsInputSchema,
    outputSchema: SecurityRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await securityRecommendationsPrompt(input);
    return output!;
  }
);
