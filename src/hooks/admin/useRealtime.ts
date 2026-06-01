import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useRealtime(table: string, onChange: () => void) {
  useEffect(() => {
    const ch = supabase
      .channel(`rt-${table}-${Math.random().toString(36).slice(2, 7)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => onChange())
      .subscribe();
    const interval = setInterval(onChange, 30000);
    return () => {
      supabase.removeChannel(ch);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);
}
