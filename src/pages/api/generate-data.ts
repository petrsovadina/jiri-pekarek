import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('anthropic_api_key')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.anthropic_api_key) {
      return res.status(400).json({ message: 'API key not found' });
    }

    const key = process.env.ENCRYPTION_KEY || 'default-encryption-key';
    const [ivHex, encryptedApiKey] = profile.anthropic_api_key.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedApiKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    const apiKey = decrypted;

    const anthropic: Anthropic = new Anthropic({ apiKey });
    type AnthropicType = typeof anthropic;

    const { table, prompt } = req.body;

    if (!table || !prompt) {
      return res.status(400).json({ message: 'Table and prompt are required' });
    }

    try {
      const generatedData = [];
      const batchSize = 10;
      for (let i = 0; i < table.length; i += batchSize) {
        const batch = table.slice(i, i + batchSize);
        try {
          const responses = await Promise.all(
            batch.map(row =>
              anthropic.completions.create({
                model: "claude-2",
                prompt: `${prompt}\n\n${JSON.stringify(row)}`,
                max_tokens_to_sample: 200,
              })
            )
          );
          generatedData.push(...responses.map(response => response.completion));
        } catch (error) {
          console.error('Error generating data for batch:', batch, error);
          generatedData.push(...batch.map(() => null));
        }
      }

      res.status(200).json({ message: 'Data generation endpoint', apiKey, table, prompt, generatedData });
    } catch (error) {
      console.error('Error generating data:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } catch (error) {
    console.error('Error generating data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
