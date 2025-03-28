import { initializeApp } from "firebase/app";
import {
  getFirestore,
  where,
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  FieldValue,
  QueryDocumentSnapshot,
  setDoc,
  Firestore,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { firebaseConfig } from "./fireConfig";
// import { generateRandomString } from "./tools";
// import { y } from "../App";
//
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

type DataItem = {
  id: string;
  [key: string]: unknown;
};

type WhereFilterOp =
  | "=="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "array-contains"
  | "in"
  | "array-contains-any"
  | "not-in";

// Función principal para obtener todos los documentos de una colección
export const getAll = async (collectionName: string) => {

  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);

  const data: any[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return data; // Retorna los documentos
};

// Obtener datos de una colección basados en una condición
export const getWhere = async (
  collectionName: string,
  fieldPath: string,
  opStr: WhereFilterOp,
  value: unknown
): Promise<DataItem[]> => {
  const q = query(
    collection(db, collectionName),
    where(fieldPath, opStr, value)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Obtener datos de una colección basados en un rango de fechas
export const getRangeDate = async (
  collectionName: string,
  startDate: Date,
  endDate: Date
): Promise<DataItem[]> => {
  const q = query(
    collection(db, collectionName),
    where("date", ">=", startDate),
    where("date", "<=", endDate)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const add = async (
  collectionName: string,
  data: Record<string, any>
) => {
  const colRef = collection(db, collectionName);

  // Si no tiene fecha de creación, se agrega la fecha actual
  if (!data.createdAt) {
    data.createdAt = new Date().toISOString(); // Fecha en formato ISO
  }

  if (data.id) {
    const docRef = doc(colRef, data.id);
    await setDoc(docRef, data);
    
    return {
      id: data.id,
      message: "Documento creado o actualizado exitosamente",
    };
  } else {
    throw new Error("Falta ID en los datos");
  }
};



export const update = async (
  collectionName: string,
  data: Record<string, any>
): Promise<{ ok: boolean }> => {
  try {

    if (!data.id) {
      throw new Error("Falta ID en los datos para actualizar");
    }

    const docRef = doc(db, collectionName, data.id);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      throw new Error(
        `El documento con ID ${data.id} no existe en la colección ${collectionName}`
      );
    }

    // Si el campo 'date' no está presente, agregar un timestamp actual (milisegundos)
    if (!data.date) {
      data.date = Date.now();
    }

    await setDoc(docRef, data, { merge: true });


    
    return { ok: true };
  } catch (error) {
    console.error("Error en la actualización:", error);
    return { ok: false }; // En caso de error, devuelve { ok: false }
  }
};

// Eliminar un documento específico

export const remove = async (
  collectionName: string,
  docId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef); // Intenta eliminar el documento

    return {
      success: true,
      message: `Documento con ID ${docId} eliminado exitosamente.`,
    };
  } catch (error: any) {
    console.error(`Error al eliminar el documento con ID ${docId}:`, error);
    return {
      success: false,
      message: `Error al eliminar el documento: ${
        error.message || "Error desconocido"
      }`,
    };
  }
};
// Obtener un documento específico
export const getSingle = async (
  collectionName: string,
  docId: string
): Promise<any> => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      return { id: docSnapshot.id, ...docSnapshot.data() }; // Devuelve el documento con su ID
    } else {
      return null; // Documento no encontrado
    }
  } catch (error) {
    console.error("Error al obtener el documento:", error);
    throw new Error("No se pudo obtener el documento"); // Manejo de error opcional
  }
};

export async function getAllValuesUniqKey(
  collectionName: string,
  key: string
): Promise<string[]> {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef); // Aquí podrías incluir select() si está disponible en tu versión del SDK

  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc: QueryDocumentSnapshot) => doc.data()[key]
    );
  } catch (error) {
    console.error("Error al obtener documentos: ", error);
    return []; // Devolver un arreglo vacío en caso de error
  }
}
// Define a generic type for the array elements
type ArrayElement = string; // Change this type according to your array elements

// Function to add a new value to an array field in a Firestore document

export async function updateArrayAdd(
  collection: string,
  document: string,
  array: string,
  newValue: any
): Promise<void> {
  const Ref = doc(db, collection, document);
  await updateDoc(Ref, {
    [array]: arrayUnion(newValue), // Agrega el valor al array sin duplicados
  });
}
export async function updateKey(
  collection: string,
  document: string,
  key: string,
  newValue: any
): Promise<void> {
  const Ref = doc(db, collection, document);
  await updateDoc(Ref, {
    [key]: newValue, // Actualiza el valor de la clave especificada
  });
}

// Function to remove a value from an array field in a Firestore document
export async function updateArrayRemove(
  collection: string,
  document: string,
  array: string,
  value: ArrayElement
): Promise<void> {
  const docRef = doc(db, collection, document);

  try {
    // Atomically remove a value from the array field
    await updateDoc(docRef, {
      [array]: arrayRemove(value),
    });
  } catch (error) {
    console.error("Error updating document: ", error);
    throw error; // Re-throw the error for further handling if needed
  }
}
