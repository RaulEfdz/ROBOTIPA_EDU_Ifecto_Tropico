export function generateRandomId(length: number): string {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let randomId = '';
  
	for (let i = 0; i < length; i++) {
	  const index = Math.floor(Math.random() * characters.length);
	  randomId += characters.charAt(index);
	}
  
	return randomId;
  }
  
  // Uso de la función para generar un ID aleatorio de longitud 10
  const randomId = generateRandomId(10);
  