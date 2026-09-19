import { connectDB } from "@/lib/db";
import DailyDistance from "@/models/dailydistance";
import dayjs from "dayjs";

// Render on every request (don't snapshot DB data at build time)
export const dynamic = "force-dynamic";

/**
 * How many days this page shows when no window is asked for.
 *
 * The whole collection is far too large to return: at the current rate it
 * renders several megabytes, past the response size a serverless function is
 * allowed to send, and it grows every day. A window keeps the page bounded no
 * matter how much history accumulates.
 */
const DEFAULT_DAYS = 7;
const MAX_DAYS = 90;
const MAX_ROWS = 1000;

type Props = { searchParams?: { days?: string; date?: string } };

export default async function DailyDistancePage({ searchParams }: Props) {
  await connectDB();

  // ?date=YYYY-MM-DD for one day, ?days=N for a window, default last 7 days.
  const date = searchParams?.date;
  const days = Math.min(
    Math.max(parseInt(searchParams?.days ?? "", 10) || DEFAULT_DAYS, 1),
    MAX_DAYS,
  );

  // DailyDistance.date is a "YYYY-MM-DD" string, so a lexical range works.
  const today = dayjs().format("YYYY-MM-DD");
  const from = dayjs().subtract(days - 1, "day").format("YYYY-MM-DD");
  const query = date ? { date } : { date: { $gte: from, $lte: today } };
  const label = date ? date : `${from} to ${today}`;

  const records = await DailyDistance.find(query)
    .sort({ date: -1 })
    .limit(MAX_ROWS + 1)
    .populate({
      path: "employeeId",
      select: "name phone", // only fields you need
    })
    .lean();

  const truncated = records.length > MAX_ROWS;
  const rows = truncated ? records.slice(0, MAX_ROWS) : records;

  return (
    <div style={{ padding: 20 }}>
      <h1>Employee Daily Distance</h1>

      <p style={{ marginTop: 8, color: "#555" }}>
        Showing <strong>{rows.length}</strong> record{rows.length === 1 ? "" : "s"} for{" "}
        <strong>{label}</strong>.{" "}
        {truncated && (
          <>
            Only the first {MAX_ROWS} are listed — narrow the range to see the rest.{" "}
          </>
        )}
        Use <code>?days=30</code> for a wider window (max {MAX_DAYS}) or{" "}
        <code>?date=YYYY-MM-DD</code> for a single day.
      </p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 16,
        }}
      >
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Phone</th>
            <th>Date</th>
            <th>Total KM</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row: any) => (
            <tr key={String(row._id)}>
              {/* employeeId is null when the employee has since been deleted */}
              <td>{row.employeeId?.name || "—"}</td>
              <td>{row.employeeId?.phone || "—"}</td>
              <td>{row.date}</td>
              <td>{typeof row.totalKm === "number" ? row.totalKm.toFixed(2) : "0.00"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && (
        <p style={{ marginTop: 16, color: "#555" }}>No records in this range.</p>
      )}
    </div>
  );
}
