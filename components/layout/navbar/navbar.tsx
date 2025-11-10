import { createClient } from '@/lib/utils/supabase/server';
import { NavLinks } from './nav-links';

export default async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <>
      <NavLinks user={user} />
    </>
  );
}
