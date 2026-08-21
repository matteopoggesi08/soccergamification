import { signInWithGoogleAction } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { GoogleIcon } from '@/components/shared/google-icon';

export default function RegisterPage() {
  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        La registrazione avviene con lo stesso pulsante del login: se non hai ancora un
        account, ne verrà creato uno automaticamente al primo accesso.
      </p>
      <form action={signInWithGoogleAction}>
        <Button type="submit" className="flex items-center justify-center gap-2">
          <GoogleIcon />
          Crea account con Google
        </Button>
      </form>
    </div>
  );
}
