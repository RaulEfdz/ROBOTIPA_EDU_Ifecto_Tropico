import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { useQuizContext } from "../context/QuizContext";
import { Input } from "@/components/ui/input";

interface ScheduleData {
  closeDate: {
    timestamp: number;
  }
}

interface FormErrors {
  hour: string;
}

interface DateTimeSelectorProps {
  initialDate: Date;
  onDateTimeChange: (date: Date) => void;
  errors: FormErrors;
}

const DateTimeSelectors: React.FC<DateTimeSelectorProps> = ({
  initialDate,
  onDateTimeChange,
  errors,
}) => {
  // const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(Number(initialDate) - (2 * 24 * 60 * 60 * 1000))
  );

  useEffect(() => {
    onDateTimeChange(selectedDate);
  }, [selectedDate, onDateTimeChange]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
      setSelectedDate(newDate);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    
    const [hours, minutes] = e.target.value.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;

    const newDate = new Date(selectedDate);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setSelectedDate(newDate);
  };

  const formatTimeForInput = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label htmlFor="time" className="text-sm font-medium">
            Hora de cierre
          </Label>
          <Input
            type="time"
            id="time"
            value={formatTimeForInput(selectedDate)}
            onChange={handleTimeChange}
            className="w-full"
          />
          {errors.hour && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.hour}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Fecha de cierre</Label>
          <Calendar
            lang="es"
            mode="single"
            selected={selectedDate}
            onSelect={handleDateChange}
            className="rounded-md border"
            disabled={(date) => date < new Date()}
          />
        </div>
      </div>
    </div>
  );
};

export const ScheduleQuizModal: React.FC<{ 
  open: boolean; 
  setOpen: (open: boolean) => void; 
  setProgrammer: (data: ScheduleData) => void; 
}> = ({
  open,
  setOpen,
  setProgrammer,
}) => {
  const { quiz } = useQuizContext();
  
  // Asegurarse de que siempre tengamos una fecha válida
  const initialDate = quiz?.closeDate?.timestamp 
    ? new Date(quiz.closeDate.timestamp)
    : new Date();

  const [selectedDateTime, setSelectedDateTime] = useState<Date>(initialDate);
  const [errors, setErrors] = useState<FormErrors>({ hour: "" });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = { hour: "" };
    let isValid = true;

    if (selectedDateTime < new Date()) {
      newErrors.hour = "La fecha y hora deben ser futuras";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = (): void => {
    // if (validateForm()) {
      // Asegurarse de que el timestamp sea un número válido
      const timestamp = selectedDateTime.getTime();
      
      if (!isNaN(timestamp)) {
        const scheduleData: ScheduleData = {
          closeDate: {
            timestamp: timestamp
          }
        };
        setProgrammer(scheduleData);
        setOpen(false);
      } else {
        setErrors({ hour: "Fecha u hora inválida" });
      }
    // }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Programar fecha de cierre del cuestionario
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <DateTimeSelectors
            initialDate={initialDate}
            onDateTimeChange={setSelectedDateTime}
            errors={errors}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button variant="default" onClick={handleSave} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
            Guardar programación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleQuizModal;