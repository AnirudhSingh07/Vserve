import { connectDB } from "@/lib/db";
import DailyDistance from "@/models/dailydistance";

export default async function DailyDistancePage() {
  await connectDB();

  const records = await DailyDistance.find()
    .populate({
      path: "employeeId",
      select: "name phone", // only fields you need
    })
    .lean();

  return (
    <div style={{ padding: 20 }}>
      <h1>Employee Daily Distance</h1>

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
          {records.map((row: any) => (
            <tr key={row._id}>
              <td>{row.employeeId?.name || "—"}</td>
              <td>{row.employeeId?.phone || "—"}</td>
              <td>{row.date}</td>
              <td>{row.totalKm.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Debug view */}
      <pre style={{ marginTop: 24 }}>{JSON.stringify(records, null, 2)}</pre>
    </div>
  );
}
