# Export Module

This module provides CSV and Excel export functionality for various GodJira entities.

## Features

- Export issues with filtering
- Export sprint reports (summary + issues)
- Export work logs
- Export user activity reports
- Multiple format support (CSV and Excel)
- Date range filtering
- Project and sprint filtering
- User-specific filtering
- Auto-formatted Excel files with styled headers
- Proper file download with appropriate MIME types

## Endpoints

### 1. Export Issues
```
GET /api/v1/export/issues
```

**Query Parameters:**
- `format` (required): `CSV` or `EXCEL`
- `projectId` (optional): Filter by project
- `sprintId` (optional): Filter by sprint
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)

**Example:**
```bash
curl -X GET "http://localhost:3000/api/v1/export/issues?format=EXCEL&projectId=123&startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output issues.xlsx
```

### 2. Export Sprint Report
```
GET /api/v1/export/sprints/:id
```

**Query Parameters:**
- `format` (required): `CSV` or `EXCEL`

**Features:**
- Summary sheet with sprint overview, metrics, and status
- Issues sheet with all sprint issues
- Excel format includes multiple sheets

**Example:**
```bash
curl -X GET "http://localhost:3000/api/v1/export/sprints/abc123?format=EXCEL" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output sprint-report.xlsx
```

### 3. Export Work Logs
```
GET /api/v1/export/work-logs
```

**Query Parameters:**
- `format` (required): `CSV` or `EXCEL`
- `projectId` (optional): Filter by project
- `userId` (optional): Filter by user
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)

**Features:**
- Time spent in both hours and minutes
- Issue and project details
- User information

**Example:**
```bash
curl -X GET "http://localhost:3000/api/v1/export/work-logs?format=CSV&userId=user123&startDate=2025-01-01" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output work-logs.csv
```

### 4. Export User Activity
```
GET /api/v1/export/user-activity/:userId
```

**Query Parameters:**
- `format` (required): `CSV` or `EXCEL`
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)

**Features:**
- Created issues
- Assigned issues
- Comments made
- Work logs
- Chronologically sorted

**Example:**
```bash
curl -X GET "http://localhost:3000/api/v1/export/user-activity/user123?format=EXCEL&startDate=2025-01-01" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output user-activity.xlsx
```

## Excel Format Features

- **Styled Headers**: Blue background (#4472C4), white text, bold
- **Auto-sized Columns**: Columns automatically resize based on content (max 50 chars)
- **Multiple Sheets**: Sprint reports include multiple sheets (Summary, Issues)
- **Formatted Data**: Proper number formatting, date formatting

## CSV Format Features

- **Standard CSV**: Compatible with Excel, Google Sheets, and other tools
- **Headers Included**: First row contains column names
- **UTF-8 Encoding**: Supports international characters
- **Comma Separated**: Standard comma-delimited format

## File Naming Convention

Files are automatically named with descriptive names and timestamps:
- Issues: `issues-YYYY-MM-DD.{csv|xlsx}`
- Sprint Report: `sprint-report-{sprintId}-YYYY-MM-DD.{csv|xlsx}`
- Work Logs: `work-logs-YYYY-MM-DD.{csv|xlsx}`
- User Activity: `user-activity-{userId}-YYYY-MM-DD.{csv|xlsx}`

## Authentication

All endpoints require JWT authentication via Bearer token:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Error Handling

- **400 Bad Request**: Missing required parameters (format)
- **401 Unauthorized**: Invalid or missing JWT token
- **404 Not Found**: Sprint not found (for sprint export)
- **500 Internal Server Error**: Server-side error during export

## Dependencies

- **exceljs**: Excel file generation
- **csv-writer**: CSV file generation
- **@nestjs/common**: NestJS core functionality
- **@nestjs/swagger**: API documentation

## Implementation Details

### Service Methods

1. **exportIssues**: Queries issues with filters, formats data, generates file
2. **exportSprintReport**: Fetches sprint with issues, creates summary, generates multi-sheet Excel
3. **exportWorkLogs**: Queries work logs with filters, includes time calculations
4. **exportUserActivity**: Aggregates user's activities (issues, comments, work logs)
5. **generateCSV**: Generic CSV generation from data objects
6. **generateExcel**: Generic Excel generation with styling
7. **generateExcelWithMultipleSheets**: Creates Excel files with multiple sheets

### Response Headers

All export endpoints set appropriate headers:
```
Content-Type: text/csv (CSV) or application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (Excel)
Content-Disposition: attachment; filename="filename.{csv|xlsx}"
Content-Length: {buffer-length}
```

## Testing

Use the Swagger UI at `/api/docs` to test export endpoints interactively:
1. Navigate to the Export section
2. Authenticate with your JWT token
3. Select an endpoint
4. Provide required parameters
5. Click "Execute"
6. Download the generated file

## Future Enhancements

- [ ] Custom field selection (choose which columns to export)
- [ ] Custom templates for exports
- [ ] Scheduled exports (email delivery)
- [ ] Export to other formats (PDF, JSON)
- [ ] Bulk export (all projects, all sprints)
- [ ] Export history tracking
- [ ] Export size limits and pagination
