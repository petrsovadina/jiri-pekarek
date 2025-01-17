import Settings from '@/pages/Settings';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { act } from 'react-dom/test-utils';

jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user' } } } }),
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn().mockResolvedValue({ data: { anthropic_api_key: 'test-api-key' } }),
      })),
      update: jest.fn().mockResolvedValue({}),
    })),
  },
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

describe('Settings', () => {
  it('should render settings page', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      );
    });
    expect(screen.getByRole('heading', { name: 'Nastavení' })).toBeInTheDocument();
    expect(screen.getByLabelText('API klíč Anthropic Claude')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Uložit' })).toBeInTheDocument();
  });

  it('should load api key from supabase', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      );
    });

    expect(screen.getByLabelText('API klíč Anthropic Claude')).toHaveValue('test-api-key');
  });

  it('should save api key to supabase', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      );
    });

    const input = screen.getByLabelText('API klíč Anthropic Claude');
    fireEvent.change(input, { target: { value: 'new-api-key' } });
    fireEvent.click(screen.getByRole('button', { name: 'Uložit' }));

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledTimes(1);
      expect(supabase.from().update).toHaveBeenCalledTimes(1);
      expect(supabase.from().update).toHaveBeenCalledWith({ anthropic_api_key: 'new-api-key' });
    });
  });
  it('should show error toast if saving api key fails', async () => {
    jest.mock('@/integrations/supabase/client', () => ({
      supabase: {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: { anthropic_api_key: 'test-api-key' } } }),
          })),
          update: jest.fn().mockResolvedValue({ error: new Error('test-error') }),
        })),
      },
    }));

    const { toast } = useToast();

    await act(async () => {
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      );
    });

    const input = screen.getByLabelText('API klíč Anthropic Claude');
    fireEvent.change(input, { target: { value: 'new-api-key' } });
    fireEvent.click(screen.getByRole('button', { name: 'Uložit' }));

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Chyba',
        description: 'Nepodařilo se uložit API klíč',
      });
    });
  });
});
