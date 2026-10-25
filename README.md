# Meter Check

Check a batch of equipment readings against your own type rules and service intervals. Find entries to correct, see what is due and copy a separate results report.

**[Try the complete browser app](https://brodyga45.com/apps/meter-check/)** · [About the product](https://brodyga45.com/work/meter-check/)

No account, backend, paid API, analytics or browser storage. The app reads CSV/TSV files locally or accepts pasted spreadsheet rows. Your inputs stay in the current tab and are not saved when you leave.

## Recurring work in Google Sheets

For saved rules and repeated reading updates inside a spreadsheet, use the free [editable Sheets workbook and setup guide](sheets/README.md). Its input layout, formulas and limits are separate from the browser batch checker. Import the provided XLSX into your own Google Sheets; it contains only fictional records.

## Run

Requirements: Python 3 for the local static server; a modern browser with JavaScript modules and BigInt. Node.js 22 or newer is recommended for the built-in test runner; there are no npm dependencies.

```sh
python3 -m http.server 8794 --bind 127.0.0.1
```

Open http://127.0.0.1:8794/ and choose **Check fictional batch**. Stop the server with Ctrl+C. Opening `index.html` directly as a file is not the supported module-loading workflow.

```sh
node --test test/meter-check.test.mjs
```

## Use your own table

1. Paste a table or open a UTF-8 CSV/TSV. Auto detection, comma, semicolon, tab and pipe separators are supported.
2. Enter your approved equipment types, hours/km units, positive service interval and warning window. Example rules are fictional, not maintenance recommendations.
3. Match the columns if your headers differ, then confirm your rules and check the batch.
4. Correct flagged inputs and run again. Source or rule edits invalidate the old results.
5. Filter or find an equipment ID. **Copy results report** includes all checked rows even when filtered or paginated. If clipboard access fails, expand **Show results report** and copy the text manually.

Required fields: equipment ID, type, previous reading, current reading and reading at last service. A unit column is optional: when absent, the configured type supplies the unit; when present, it must match. SMR/hours and ODOMETER/km aliases are accepted.

Each equipment ID must be unique in the batch. IDs keep leading zeros and case; outer spaces are trimmed. Type matching ignores case and outer spaces. Numbers use a dot decimal, no thousands separators and at most three decimal places, from zero through 1,000,000,000.999.

## What the report means

- Next due = last-service reading + interval. Remaining = next due minus current reading.
- Negative remaining is overdue; zero is due now; positive remaining inside the warning window is due soon. Other valid rows are not due. An overdue interval is never automatically advanced into the future.
- Missing/unsupported numbers, decreasing readings, last-service readings above current, unknown types, conflicting units and duplicate IDs require review and receive no calculated schedule.
- Arithmetic uses scaled integers to avoid floating-point errors at due boundaries.

Paste the results into a **new report tab or empty range**, keeping your original tracker. Match records by equipment ID and input row. The report omits previous readings, last-service readings and extra source columns. Format the destination equipment-ID column as plain text first: a spreadsheet can otherwise change leading-zero IDs. Formula-like cells have a leading apostrophe, and embedded tabs/line breaks become spaces. Behaviour in a particular receiving spreadsheet is not certified.

## Limits

Up to 2 MiB, 2,000 equipment records and 80 columns; strict quoting, header and row-width checks. One service interval per type; hours or km only. No calendar schedules, multiple concurrent maintenance schedules, automatic meter-replacement reconciliation, live Sheets connection or assessment of mechanical condition. A valid calculation does not establish that a reading is true or that equipment is safe.

This works well for a discrete batch audit. For daily use, a configured spreadsheet with formulas/lookups/validation may be more convenient. Use your own approved intervals and review unexpected readings with the responsible operator.

## Verification and provenance

34 automated checks cover mixed statuses, exact decimals, type/unit/ID errors, malformed CSV, bounds, complete 2,000-row output and report text handling. Before publication, the hosted app was checked in Chrome with a six-row example, custom column mapping, stale-result invalidation, and a 205-row fictional CSV with complete report copy/paste. `test/browser-205-rows.csv` is that synthetic fixture.

An independent internal AI reviewer also ran the 34 tests and checked custom TSV/rule-edit flows. A misleading copy-button label was corrected to state that the output is a separate report. This is not a human audit, customer acceptance or safety certification. Physical mobile-device behaviour and a real Google Sheets/Excel import are not claimed verified.

This repository packages the reviewed app for standalone use. Only navigation links were made absolute; the calculation, parser, application logic and styles match the published app. The original development and review records remain separate from this public source package. No client code, real equipment data or third-party project source is included. The parser derives from our own CSV utility.

Klemm, an AI coding assistant, implemented and checked the software for Ignat Sokolov / brodyga45. This is a personal software product, not a paid client case.

## Tailoring

The checker and its MIT-licensed source are free. A tailored validation/next-due module in an existing Google Sheets tracker is offered at **US$90 fixed**, normally two working days after layout, access, scope and payment are agreed. It includes editable configuration, source, checks, setup notes and one in-scope correction. Client data, authorised installation, acceptance and business-payment arrangements are separate. [Discuss a tracker](https://brodyga45.com/contact/?project=Meter%20Check%20integration).

## License

MIT. See [LICENSE](LICENSE). All bundled records and example service intervals are fictional.
