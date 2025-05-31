import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { firebaseConfig } from "./firebase/fireConfig";

let firebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

const db = getFirestore(firebaseApp);

const COLLECTION_CLICKS =
  process.env.NEXT_PUBLIC_FIREBASE_COLLECTION_CLICKS || "user_clicks";
const COLLECTION_PAGEVIEWS =
  process.env.NEXT_PUBLIC_FIREBASE_COLLECTION_PAGEVIEWS || "user_pageviews";
const COLLECTION_ANONYMOUS_LINKS =
  process.env.NEXT_PUBLIC_FIREBASE_COLLECTION_ANONYMOUS_LINKS ||
  "user_anonymous_supabase_links";

let anonymousId: string | null = null;
let supabaseUserId: string | null = null;

export function initializeAnonymousTrackingId() {
  if (typeof window === "undefined") return;
  const storedId = localStorage.getItem("anonymous_tracking_id");
  if (storedId) {
    anonymousId = storedId;
  } else {
    anonymousId = uuidv4();
    localStorage.setItem("anonymous_tracking_id", anonymousId);
  }
}

export async function linkSupabaseUser(user: { id: string } | null) {
  if (!anonymousId || !user) return;
  supabaseUserId = user.id;
  const docRef = doc(db, COLLECTION_ANONYMOUS_LINKS, anonymousId);
  try {
    await setDoc(
      docRef,
      {
        supabaseUserId: supabaseUserId,
        linkedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error linking anonymous ID with Supabase user:", error);
  }
}

export async function trackClick(
  elementName: string,
  additionalData: Record<string, any> = {}
) {
  if (!anonymousId) return;
  try {
    await addDoc(collection(db, COLLECTION_CLICKS), {
      anonymousId,
      supabaseUserId,
      elementName,
      timestamp: serverTimestamp(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...additionalData,
    });
  } catch (error) {
    console.error("Error tracking click event:", error);
  }
}

export async function trackPageView(path: string, title: string) {
  if (!anonymousId) return;
  try {
    await addDoc(collection(db, COLLECTION_PAGEVIEWS), {
      anonymousId,
      supabaseUserId,
      path,
      title,
      timestamp: serverTimestamp(),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    });
  } catch (error) {
    console.error("Error tracking page view event:", error);
  }
}
