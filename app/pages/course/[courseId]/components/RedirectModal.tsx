"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  url: string;
  onClose: () => void;
}

export default function RedirectModal({ url, onClose }: Props) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown <= 0) {
      clearInterval(timer);
      window.open(url, "_blank");
      onClose();
    }

    return () => clearInterval(timer);
  }, [countdown, url, onClose]);

  const handleRedirectNow = () => {
    window.open(url, "_blank");
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Redirigiendo al pago...</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500">
          Te redirigiremos automáticamente en {countdown} segundo
          {countdown === 1 ? "" : "s"}.
        </p>
        <DialogFooter>
          <Button onClick={handleRedirectNow}>Ir ahora</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
