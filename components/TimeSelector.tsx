import React, { useState, useEffect } from "react";

type TimeSelectorProps = {
  hourRange?: [number, number];
  initialTime?: string;
  setDate: (time: string) => void;
};

const TimeSelector: React.FC<TimeSelectorProps> = ({
  hourRange = [1, 12],
  initialTime,
  setDate,
}) => {
  const [selectedHour, setSelectedHour] = useState<number>(
    initialTime ? parseInt(initialTime.split(":")[0]) : new Date().getHours() % 12 || 12
  );
  const [selectedMinute, setSelectedMinute] = useState<number>(
    initialTime ? parseInt(initialTime.split(":")[1]) : new Date().getMinutes()
  );
  const [selectedMeridian, setSelectedMeridian] = useState<string>(
    initialTime?.split(" ")[1] || (new Date().getHours() >= 12 ? "PM" : "AM")
  );

  useEffect(() => {
    const formattedTime = `${String(selectedHour).padStart(2, "0")}:${String(
      selectedMinute
    ).padStart(2, "0")} ${selectedMeridian}`;
    setDate(formattedTime);
  }, [selectedHour, selectedMinute, selectedMeridian, setDate]);

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedHour(parseInt(e.target.value));
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMinute(parseInt(e.target.value));
  };

  const handleMeridianChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMeridian(e.target.value);
  };

  return (
    <div className="inline-flex text-xl border rounded-md shadow-md p-4 bg-[#FFFCF8]">
      <select
        value={selectedHour}
        onChange={handleHourChange}
        className="text-3xl font-semibold px-2 outline-none appearance-none bg-transparent rounded-sm cursor-pointer hover:bg-slate-200"
      >
        {Array.from({ length: hourRange[1] - hourRange[0] + 1 }, (_, i) => {
          const hour = hourRange[0] + i;
          return (
            <option key={hour} value={hour}>
              {String(hour).padStart(2, "0")}
            </option>
          );
        })}
      </select>

      <span className="text-3xl font-semibold px-2">:</span>

      <select
        value={selectedMinute}
        onChange={handleMinuteChange}
        className="text-3xl font-semibold px-2 outline-none appearance-none bg-transparent rounded-sm cursor-pointer hover:bg-slate-200"
      >
        {Array.from({ length: 60 }, (_, i) => (
          <option key={i} value={i}>
            {String(i).padStart(2, "0")}
          </option>
        ))}
      </select>

      <select
        value={selectedMeridian}
        onChange={handleMeridianChange}
        className="text-3xl font-semibold px-2 outline-none appearance-none bg-transparent rounded-sm cursor-pointer hover:bg-slate-200"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};

export default TimeSelector;
