export const fetchDataQuick = async (path: string, fetchData: any = {}) => {
	try {
	  const response = await fetch(path, {
		method: 'POST', // Especifica el método POST
		headers: {
		  'Content-Type': 'application/json' 
		},
		body: JSON.stringify(fetchData)
	  });
  
	  if (!response.ok) {
		throw new Error('Network response was not ok');
	  }
  
	  const data = await response.json();
		return data
	} catch (error) {
	  console.error('Error al cargar los usuarios:', error);
	}
  };
  

