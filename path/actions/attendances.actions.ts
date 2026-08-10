'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function setAttendanceAction(
  trainingId: string,
  playerId: string,
  status: 'presente' | 'assente'
) {
  const supabase = await createClient();
  await supabase
    .from('attendances')
    .upsert(
      { training_id: trainingId, player_id: playerId, status },
      { onConflict: 'training_id,player_id' }
    );
  revalidatePath(`/allenamenti/${trainingId}/presenze`);
}
