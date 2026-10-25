# Meter Check in Google Sheets

Keep equipment type rules and meter readings in one workbook. Change a reading or interval and the due status updates in the same sheet.

Download [the editable workbook](meter-check-sheets.xlsx) and import it into your own Google Sheets. A Google account is needed to create and edit that Google Sheet. This package contains only our own formulas and fictional records.

## Try the fictional example

In your imported workbook, open **Rules** and set the two example rows' **Approved** values to **Yes**. Return to **Tracker** to see not-due, due-soon, due-now, overdue and review examples. Change one current reading and see the result update.

These intervals are fictional demonstration values. Replace them with your own documented rules before using real equipment data.

## Set up your tracker

1. In **Rules**, edit cells **A7:E26**. Give each type a unique name, choose `hours` or `km`, enter its positive service interval and a nonnegative warning window, then set **Approved** to **Yes**. Use a numeric `0` for no warning window. A blank interval or warning is invalid.
2. In **Tracker**, replace the example inputs in **A8:F2007**. Use one row per equipment ID. Enter ID, type, optional unit, current reading, optional previous reading and the reading at the last actual service. A blank unit uses the approved type rule; a supplied unit must match it. Keep calculated columns **G:N**.
3. For ongoing use, copy the old current reading into **Previous**, then enter the new reading in **Current**. Change **Last service** only when service has actually occurred.
4. For a filter, select **A7:N2007** and use the Sheets **Create a filter** command once. Then filter **Status** to inspect `Review` rows first. Correct the accompanying **Input issue**, then review `Overdue`, `Due now` and `Due soon` records.

Paste values only into the six input columns. Equipment IDs use plain-text formatting; verify IDs after any import, especially if another program already converted them to numbers. Current, previous and last-service readings must be actual numbers, not numeric-looking text.

## Calculation and validation

- Next due = last actual service reading + the type's approved interval.
- Remaining = next due − current reading, rounded to three decimal places.
- Negative remaining is overdue, zero is due now, and a positive value within the warning window is due soon. An overdue schedule is never silently rolled forward.
- Invalid or unapproved rules, missing required readings, duplicate IDs or types, unknown types, unit mismatches, decreased readings and last-service readings above current produce `Review` and no schedule.
- IDs and type names are compared without case. Special characters such as `*` and `?` are treated literally. Blank previous readings are allowed. A real zero reading is valid. A blank Unit input inherits the type's rule, while Unit used shows the applied unit.

There are 2,000 equipment rows and 20 type-rule slots. Readings and numeric rule values support up to three decimal places and a maximum of 999,999,999. Intervals must be positive; readings and warning windows may be zero. Rows outside the prepared input ranges have no promised calculation coverage.

This workbook supports one meter-based service interval per type. It has no calendar alerts, scripts, background monitoring, automatic meter-replacement reconciliation, maintenance history or assessment of mechanical condition. It is a reusable tracker template, not an installation into an existing client workbook. The browser batch checker and this workbook have separate implementations and limits.

## Checks

The author checked 44 scenarios in the local workbook engine, then checked 23 additional case rows in native Google Sheets, the six example outcomes, the last supported equipment row and recalculation after changing an interval and warning window. An ordinary two-row native clipboard paste was checked: leading-zero IDs remained text, readings became numbers, the unit dropdown remained and statuses recalculated. Temporary author test records were removed from the template.

These checks establish the described behaviour in the tested environment. They do not establish a customer's workflow preference, engineering interval correctness or a paid delivery.

## Adapt an existing workbook

The workbook is free to import, copy and edit. Only native Google Sheets behaviour was checked; Excel compatibility is not certified. If it fits your workflow, use it as it is.

Adapting the validation and next-due module to one agreed existing Google Sheets layout is offered at **US$90 fixed**, normally two working days after scope, access and payment terms are agreed. This covers up to five agreed equipment types and 2,000 rows, editable configuration, formulas/source, checks, setup notes and one in-scope correction. Existing scripts, multiple schedules, histories and calendar automation require separate scope.

[Discuss a workbook adaptation](https://brodyga45.com/contact/?project=Meter%20Check%20integration).

Klemm, an AI coding assistant, made and checked this workbook for Ignat Sokolov / brodyga45. It contains only fictional records and is not a paid client case. The formulas and bundled example workbook are MIT licensed under the repository's license.
