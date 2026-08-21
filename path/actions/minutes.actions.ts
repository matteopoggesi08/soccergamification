'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function setTrainingMinutesAction(
  trainingId: string,
  playerId: string,
  minutes: number
) {
  const supabase = await createClient();
  await supabase.from('training_minutes').upsert(
    { training_id: trainingId, player_id: playerId, minutes },
    { onConflict: 'training_id,player_id' }
  );
  revalidatePath(`/allenamenti/${trainingId}/minutaggi`);
  revalidatePath('/classifica');
}
