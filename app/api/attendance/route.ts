import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

declare global {
  // eslint-disable-next-line no-var
  var __attendanceMongoClientPromise: Promise<MongoClient> | undefined
}

function getMongoClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGO_URI
  if (!uri) {
    throw new Error("MONGO_URI is not configured")
  }

  if (!global.__attendanceMongoClientPromise) {
    const client = new MongoClient(uri)
    global.__attendanceMongoClientPromise = client.connect()
  }
  return global.__attendanceMongoClientPromise
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(500, Math.max(1, Number(searchParams.get("limit") || 100)))

    const client = await getMongoClientPromise()
    const dbName = process.env.ESSL_MONGO_DB || "attendance_db"
    const collName = process.env.ESSL_MONGO_COLLECTION || "logs"

    const logs = await client
      .db(dbName)
      .collection(collName)
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray()

    // Serialize ObjectId + Date.
    const data = logs.map((l) => ({
      ...l,
      _id: String(l?._id),
      timestamp: l?.timestamp instanceof Date ? l.timestamp.toISOString() : l?.timestamp,
      created_at: l?.created_at instanceof Date ? l.created_at.toISOString() : l?.created_at,
      updated_at: l?.updated_at instanceof Date ? l.updated_at.toISOString() : l?.updated_at,
    }))

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch attendance logs", details: String(error) },
      { status: 500 }
    )
  }
}

