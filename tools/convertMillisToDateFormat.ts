export function convertMillisToDateFormat(input: string) {
    let date;
    // Verificar el formato de entrada y crear el objeto Date
    if (input.includes(',')) {
        // Formato "2023,12,18"
        const parts = input.split(',').map(part => parseInt(part));
        date = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
        // Formato en milisegundos
        date = new Date(parseInt(input));
    }

    // Obtener los componentes de la fecha
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const dayOfWeek = days[date.getDay()];
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    // Formatear la salida
    let formattedDate = `${dayOfWeek}, ${year}-${month}-${day}`;
    if (hours !== "00" || minutes !== "00" || seconds !== "00") {
        formattedDate += ` ${hours}:${minutes}:${seconds}`;
    }

    return formattedDate;
}
