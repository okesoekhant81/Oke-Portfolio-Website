// Builds a CSV string from rows + column definitions and triggers a
// browser download — shared by every admin list's "Export CSV" button so
// the escaping/formatting logic lives in one place instead of once per page.

function escapeCsvCell(value) {
  const str = value === null || value === undefined ? '' : String(value)
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

export function toCsv(rows, columns) {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(',')
  const lines = rows.map((row) => columns.map((c) => escapeCsvCell(c.value(row))).join(','))
  return [header, ...lines].join('\r\n')
}

// A UTF-8 BOM prefix so Excel (which otherwise guesses the system codepage)
// renders Myanmar names correctly instead of as mojibake.
export function downloadCsv(filename, csv) {
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
