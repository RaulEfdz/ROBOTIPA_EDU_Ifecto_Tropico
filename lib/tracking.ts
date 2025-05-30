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

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

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
