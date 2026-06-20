import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { Transaction } from "../types";

export async function importFromGmail(): Promise<Transaction[]> {
  try {
    // Force popup to get a fresh access token
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;

    if (!token) {
      throw new Error("Could not retrieve Gmail access token");
    }

    // Query Gmail for recent receipts from common Indian food/e-commerce vendors
    const query = "from:(swiggy.in OR zomato.com OR amazon.in OR uber.com OR blinkit.com) subject:(order OR receipt OR bill OR summary)";
    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=5`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error("Failed to fetch from Gmail API");
    }

    const data = await res.json();
    if (!data.messages || data.messages.length === 0) {
      return [];
    }

    // Fetch the contents of the messages
    const emailContents = [];
    for (const msg of data.messages) {
      const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const msgData = await msgRes.json();

      let text = "";
      if (msgData.payload.parts) {
        for (const part of msgData.payload.parts) {
          if (part.mimeType === 'text/plain' && part.body.data) {
            text += atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
          }
        }
      } else if (msgData.payload.body?.data) {
        text += atob(msgData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      }
      
      const subject = msgData.payload.headers.find((h: any) => h.name === 'Subject')?.value || 'Unknown Subject';
      const date = msgData.payload.headers.find((h: any) => h.name === 'Date')?.value || new Date().toISOString();
      const from = msgData.payload.headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';

      emailContents.push({ subject, date, from, text: text.substring(0, 1000) });
    }

    // Send the raw email texts to the backend to be processed by Gemini into Transactions
    const backendRes = await fetch("/api/process-gmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails: emailContents }),
    });

    if (!backendRes.ok) {
      throw new Error("Backend failed to process Gmail receipts");
    }

    const transactions = await backendRes.json();
    return transactions;
  } catch (err: any) {
    console.error("Gmail import error:", err);
    throw err;
  }
}
