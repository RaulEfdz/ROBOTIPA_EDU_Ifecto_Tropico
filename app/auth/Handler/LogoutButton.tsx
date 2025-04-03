"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

export default function LogoutButton() {
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth' // Forzar recarga completa
  }

  return (
    <Button onClick={handleLogout}>
      Cerrar Sesión
    </Button>
  )
}