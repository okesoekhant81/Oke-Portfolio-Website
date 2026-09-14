// Rendered off-screen (hidden on screen, shown only for @media print via
// print:block) so "Print roster" can produce a clean paper attendance
// sheet without a separate route or duplicating the class-detail fetch.
function attendanceSummary(student) {
  const entries = student.attendance || []
  const present = entries.filter((a) => a.present).length
  return `${present}/${entries.length}`
}

export default function PrintableRoster({ classLabel, students }) {
  return (
    <div className="hidden print:block">
      <h1 className="text-xl font-bold">{classLabel}</h1>
      <p className="mt-1 text-sm text-neutral-600">
        {students.length} student{students.length === 1 ? '' : 's'}
      </p>
      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-black text-left">
            <th className="py-1 pr-4">Name</th>
            <th className="py-1 pr-4">Phone</th>
            <th className="py-1 pr-4">Payment</th>
            <th className="py-1 pr-4">Attendance</th>
            <th className="py-1">Signature</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="border-b border-neutral-300">
              <td className="py-2 pr-4">{s.name}</td>
              <td className="py-2 pr-4">{s.phone}</td>
              <td className="py-2 pr-4">{s.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}</td>
              <td className="py-2 pr-4">{attendanceSummary(s)}</td>
              <td className="py-2" />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
