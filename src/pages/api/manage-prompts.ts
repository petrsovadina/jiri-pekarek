import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';
import crypto from 'crypto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { name, content, description } = req.body;

      if (!name || !content) {
        return res.status(400).json({ message: 'Name and content are required' });
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const key = process.env.ENCRYPTION_KEY || 'default-encryption-key';
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      let encrypted = cipher.update(content, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const encryptedContent = `${iv.toString('hex')}:${encrypted}`;

      const { data, error } = await supabase
        .from('prompts')
        .insert({ name, content: encryptedContent, description, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error('Error saving prompt:', error);
        return res.status(500).json({ message: 'Error saving prompt' });
      }

      return res.status(200).json({ message: 'Prompt saved successfully', data });
    } catch (error) {
      console.error('Error saving prompt:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  if (req.method === 'GET') {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { data: prompts, error: promptsError } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id);

      if (promptsError) {
        console.error('Error getting prompts:', promptsError);
        return res.status(500).json({ message: 'Error getting prompts' });
      }

      const key = process.env.ENCRYPTION_KEY || 'default-encryption-key';

      const decryptedPrompts = prompts.map(prompt => {
        const [ivHex, encryptedContent] = prompt.content.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return { ...prompt, content: decrypted };
      });

      res.status(200).json({ message: 'Prompts fetched successfully', data: decryptedPrompts });
    } catch (error) {
      console.error('Error getting prompts:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
    return;
  }

  if (req.method === 'PUT') {
    try {
      const { id, name, content, description } = req.body;

      if (!id || !name || !content) {
        return res.status(400).json({ message: 'ID, name and content are required' });
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const key = process.env.ENCRYPTION_KEY || 'default-encryption-key';
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      let encrypted = cipher.update(content, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const encryptedContent = `${iv.toString('hex')}:${encrypted}`;

      const { data, error } = await supabase
        .from('prompts')
        .update({ name, content: encryptedContent, description })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating prompt:', error);
        return res.status(500).json({ message: 'Error updating prompt' });
      }

      return res.status(200).json({ message: 'Prompt updated successfully', data });
    } catch (error) {
       console.error('Error updating prompt:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
    return;
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'ID is required' });
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting prompt:', error);
        return res.status(500).json({ message: 'Error deleting prompt' });
      }

      return res.status(200).json({ message: 'Prompt deleted successfully' });
    } catch (error) {
      console.error('Error deleting prompt:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
    return;
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
