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

    // Aggregate counts by date and function
    type AggregatedData = {
      [date: string]: {
        totalClicks: number;
        functions: {
          [func: string]: number;
        };
      };
    };

    const aggregatedData: AggregatedData = {};

    clicksSnapshot.forEach((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp as Timestamp;
      const dateStr = formatDate(timestamp.toDate());
      const elementName: string = data.elementName || "unknown";

      // Extract function part before first underscore
      const func = elementName.split("_")[0] || "unknown";

      if (!aggregatedData[dateStr]) {
        aggregatedData[dateStr] = { totalClicks: 0, functions: {} };
      }

      aggregatedData[dateStr].totalClicks += 1;
      aggregatedData[dateStr].functions[func] =
        (aggregatedData[dateStr].functions[func] || 0) + 1;
    });

    // Build result array
    const result = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = formatDate(date);

      const dayData = aggregatedData[dateStr] || {
        totalClicks: 0,
        functions: {},
      };

      result.push({
        date: dateStr,
        totalClicks: dayData.totalClicks,
        functions: dayData.functions,
      });
    }

    return new Response(
      JSON.stringify({
        status: "success",
        data: result,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[TRACKING_GET_ERROR]", error);
    return new Response("Internal Error", { status: 500 });
  }
}
