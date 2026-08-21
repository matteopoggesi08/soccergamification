import { signInWithGoogleAction } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { GoogleIcon } from '@/components/shared/google-icon';

export default function LoginPage() {
  return (
    <form action={signInWithGoogleAction}>
      <Button type="submit" className="flex items-center justify-center gap-2">
        <GoogleIcon />
        Continua con Google
      </Button>
    </form>
  );
}
