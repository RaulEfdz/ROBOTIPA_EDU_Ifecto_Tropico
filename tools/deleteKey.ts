export function deleteKey(object: { [x: string]: any; hasOwnProperty: (arg0: any) => any; }, key: string | number) {
	if (object.hasOwnProperty(key)) {
	  delete object[key];
	  return true; // Key was successfully deleted
	} else {
	  return false; // Key didn't exist in the object
	}
  }
  