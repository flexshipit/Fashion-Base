export default function AdminTable({ columns = [], rows = [], emptyText = "No data" }) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-base-300 p-10 text-center text-sm opacity-70">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row._id || row.id || index}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
