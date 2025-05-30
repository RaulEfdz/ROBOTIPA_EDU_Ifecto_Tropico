import { NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";

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

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

export async function GET() {
  try {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 29); // last 30 days

    // Query clicks in last 30 days
    const clicksRef = collection(db, COLLECTION_CLICKS);
    const clicksQuery = query(
      clicksRef,
      where("timestamp", ">=", Timestamp.fromDate(startDate)),
      orderBy("timestamp", "asc")
    );
    const clicksSnapshot = await getDocs(clicksQuery);

    // Query pageviews in last 30 days
    const pageviewsRef = collection(db, COLLECTION_PAGEVIEWS);
    const pageviewsQuery = query(
      pageviewsRef,
      where("timestamp", ">=", Timestamp.fromDate(startDate)),
      orderBy("timestamp", "asc")
    );
    const pageviewsSnapshot = await getDocs(pageviewsQuery);

    // Aggregate counts by date
    const clicksByDate: Record<string, number> = {};
    clicksSnapshot.forEach((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp as Timestamp;
      const dateStr = formatDate(timestamp.toDate());
      clicksByDate[dateStr] = (clicksByDate[dateStr] || 0) + 1;
    });

    const pageviewsByDate: Record<string, number> = {};
    pageviewsSnapshot.forEach((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp as Timestamp;
      const dateStr = formatDate(timestamp.toDate());
      pageviewsByDate[dateStr] = (pageviewsByDate[dateStr] || 0) + 1;
    });

    // Build array of last 30 days with counts
    const result = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = formatDate(date);
      result.push({
        date: dateStr,
        clicks: clicksByDate[dateStr] || 0,
        pageviews: pageviewsByDate[dateStr] || 0,
      });
    }

    return NextResponse.json({
      status: "success",
      data: result,
    });
  } catch (error) {
    console.error("[ANALYTICS_TRACKING_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
