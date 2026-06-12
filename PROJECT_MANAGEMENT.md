# Project Management Feature

## Overview

The Project Management feature tracks the construction lifecycle of a site: what work is in
scope, when it will be done, how it's progressing, and a running log of dated updates with
photos. It's accessible from the main navbar and is organized per-site, mirroring the layout
used by the Circuits page (a vertical sub-navigation with four tabs).

- **Scope of Work** - define the quantities/labels for 14 construction categories and the
  estimated number of days to complete the project.
- **Timeline** - set the construction start date and working-days-per-week, track delays, and
  view a calendar with the calculated completion date.
- **Construction Progress** - mark each scoped item as Pending, Partially Complete, or
  Complete, with an overall progress bar.
- **Updates** - post dated text + photo updates, viewable as a running log.

Viewing is available to all authenticated users. Creating/editing/deleting data is restricted
to **ADMIN** and **SUPER** roles; other roles (e.g. NOC) see a read-only view (no save/add/
delete controls).

---

## Backend Implementation (`fiberTower`)

### Database tables (auto-created via `spring.jpa.hibernate.ddl-auto=update`)

| Table | Purpose |
|---|---|
| `project_scope_of_work` | One row per site. Quantity + label for each of the 14 scope categories, plus `days_to_complete`. |
| `project_timeline` | One row per site. `construction_start_date` and `working_days_per_week` (5 or 6). |
| `project_delay` | One row per recorded delay: `number_of_days`, `reason`, `date_recorded`. |
| `project_workday_override` | One row per date where the default work-day calendar is manually overridden (`date`, `is_work_day`). |
| `project_progress_item` | One row per (site, scope category): `status` (`PENDING`/`PARTIAL`/`COMPLETE`) and `percent_complete`. |
| `project_update` | One row per posted update: `update_date`, `text` (LONGTEXT), `created_at`. |
| `project_update_image` | One row per image attached to an update: `image_url`, `file_name`. |

### The 17 scope categories

Headend, BN or DN, Point To Point, Outdoor/Indoor AP, CN or RN, Direct Burial Poles +
Electrical, Pole Test and Turn Up, Direct Burial Fiber, Conduit, Fiber Pull, Breaker
Disconnects, Cameras, NEMA-Electrical, Home Installs, Inventory, Vaults, Testing.

Each category has a `<category>Quantity` (Double) and `<category>Label` (String, e.g.
"Poles" or "Cameras") field on `ProjectScopeOfWork`.

### Key behaviors

- **Upsert semantics**: `ProjectScopeOfWork` and `ProjectTimeline` are one-row-per-site. Saving
  looks up the existing row by `site_id` and updates it in place rather than creating
  duplicates.
- **Progress auto-sync**: whenever Scope of Work is saved, `ProjectManagementService` ensures a
  `ProjectProgressItem` exists for every category whose quantity is greater than 0 (defaulting
  to `PENDING` / 0%). Construction Progress only shows categories with a quantity > 0.
- **Image storage**: uploaded images are saved to disk under
  `uploads/project-updates/{siteId}/{uuid}-{sanitized-filename}` (configured via `upload.dir`
  in `application.properties`) and served statically at `/uploads/**` (configured in
  `WebConfig`). The database stores only the relative URL and original file name.

### REST API

All endpoints require authentication. Mutating endpoints additionally require the `ADMIN` or
`SUPER` role (enforced server-side, returns `403 Forbidden` otherwise).

**`/api/project-management`**
| Method | Path | Description |
|---|---|---|
| GET | `/site/{siteId}` | Returns a combined `ProjectDataDTO` (scope of work, timeline, delays, work-day overrides, progress items) for a site. |
| PUT | `/scope/{siteId}` | Upsert the scope of work. |
| PUT | `/timeline/{siteId}` | Upsert the timeline (start date, working days/week). |
| POST | `/delays/{siteId}` | Add a delay. |
| DELETE | `/delays/{delayId}` | Remove a delay. |
| PUT | `/workday-overrides/{siteId}` | Add/update a work-day override for a specific date. |
| DELETE | `/workday-overrides/{id}` | Remove a work-day override. |
| PUT | `/progress/{siteId}` | Save the full list of construction progress items. |

**`/api/project-updates`**
| Method | Path | Description |
|---|---|---|
| GET | `/site/{siteId}` | List updates for a site (newest first), including image metadata. |
| POST | `/` (multipart) | Create an update (`siteId`, `updateDate`, `text`, `images[]`). |
| PUT | `/{id}` (multipart) | Edit an update's date/text and append new images. |
| DELETE | `/{id}` | Delete an update and its image files. |
| DELETE | `/image/{imageId}` | Delete a single image from an update. |

---

## Frontend Implementation (`circuitsApp`)

### Navigation

- Added a **"Project Management"** link to the main navbar (`Layout.jsx`), visible to all
  authenticated users.
- Routes (`App.jsx`):
  - `/project-management` - site list (landing page)
  - `/project-management/:siteId` - project detail page (vertical nav with the 4 tabs)
- The Vite dev proxy (`vite.config.js`) now forwards both `/api` and `/uploads` to the backend,
  so update images load correctly in development.

### Components (`src/components/projectManagement/`)

| File | Purpose |
|---|---|
| `ProjectManagement.jsx` | Landing page - searchable table of all sites with a "Manage Project" button per row. |
| `ProjectManagementDetail.jsx` | Detail page shell - vertical nav (Scope of Work / Timeline / Construction Progress / Updates), fetches combined project data once and passes it + a `refresh()` callback to each tab. |
| `ScopeOfWork.jsx` | Form for the 14 categories (label + quantity) and "Days to Complete". |
| `Timeline.jsx` | Construction start date, working days/week, delay tracking, and original vs. current completion date. |
| `ProjectCalendar.jsx` | Month-grid calendar showing work days, holidays, manual overrides, and the completion-date marker. Click a day to toggle it as a work/non-work day. |
| `ConstructionProgress.jsx` | Lists scoped items (quantity > 0) with a status selector and overall progress bar. |
| `Updates.jsx` | Date + large text + multi-image form, plus a reverse-chronological feed of posted updates. |

### Utilities (`src/utils/`)

- `projectCategories.js` - shared list of the 14 scope categories (key + display name) and
  helpers `quantityField(key)` / `labelField(key)` that match the backend's camelCase field
  names, plus the `PROGRESS_STATUSES` options.
- `projectTimeline.js` - date helpers (`parseDateInputValue`/`formatDateInputValue`),
  `getUSHolidays(year)`, `isDefaultWorkDay`, `isWorkDay`, `getDayInfo` (used by the calendar),
  and `calculateCompletionDate(...)`, which walks day-by-day from the start date counting work
  days (respecting holidays and manual overrides) until the required number of days is reached.
- `projectManagementApi.js` - thin `fetch` wrappers for every endpoint above, handling auth
  headers and error messages consistently.

### Completion date calculation

`calculateCompletionDate({ startDate, totalDays, workingDaysPerWeek, workDayOverrides })`:

1. Starts at `startDate` and walks forward one day at a time.
2. A day counts as a "work day" if:
   - It has a manual override for that date (override always wins), **or**
   - It's Mon-Fri (always), or Saturday when `workingDaysPerWeek === 6`, **and** it's not a US
     federal holiday.
3. Counts work days until `totalDays` is reached; that date is the completion date.

US federal holidays are computed in JS (no external library): New Year's Day, MLK Day,
Presidents' Day, Memorial Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans
Day, Thanksgiving, and Christmas.

The Timeline tab shows two completion dates:
- **Original Completion Date** - based only on `daysToComplete` from Scope of Work.
- **Current Completion Date** - based on `daysToComplete` + the sum of all recorded delays.
  Adding/removing a delay recalculates this automatically.

---

## User Manual

### Accessing Project Management

1. Log in to CircuitsApp.
2. Click **Project Management** in the top navbar.
3. You'll see a searchable list of all sites. Click **Manage Project** on the desired site to
   open its project page.
4. Use the left-hand vertical menu to switch between **Scope of Work**, **Timeline**,
   **Construction Progress**, and **Updates**. Click **← Back to sites** to return to the list.

> Note: Adding, editing, or deleting data requires an ADMIN or SUPER account. Other users can
> view everything but won't see Save/Add/Delete buttons.

### 1. Scope of Work

1. Open the **Scope of Work** tab.
2. For each of the 14 categories (Headend, BN or DN, Point To Point, etc.), enter:
   - **Label** - a short name for what's being tracked (e.g. "Poles", "Cameras", "Homes").
   - **Quantity** - the number of items, feet, etc. for that category.
3. Enter **Days to Complete** - the estimated number of working days for the whole project.
4. Click **Save**.

Only categories with a quantity greater than 0 will appear later on the Construction Progress
tab.

### 2. Timeline

1. Open the **Timeline** tab.
2. Set the **Construction Start Date**.
3. Choose **Working Days per Week**: 5 (Mon-Fri) or 6 (Mon-Sat).
4. Click **Save**. The page will show:
   - **Days to Complete** (carried over from Scope of Work)
   - **Original Completion Date** (start date + days to complete, skipping non-work days and
     holidays)
   - **Current Completion Date** (same, but also adding any recorded delays)

#### Recording delays

1. Under **Delays**, enter the **Number of Days**, a **Reason**, and the **Date** the delay was
   recorded.
2. Click **Add Delay**. The **Current Completion Date** updates immediately to reflect the
   added days.
3. To remove a delay, click the 🗑️ button on its row - the completion date recalculates again.

#### Using the calendar

- The calendar shows the month containing the construction start date by default. Use
  **← Prev** / **Next →** to navigate.
- Color coding:
  - **Green** - a work day.
  - **Gray** - a non-work day (weekend or holiday).
  - **Dashed border** - this date has been manually toggled (overridden) from its default.
  - **Blue border, "Completion"** - the current calculated completion date.
  - Holiday names appear in small text on the relevant day.
- **Click any day** to toggle whether it counts as a work day. For example, mark a Saturday as
  a work day if the crew is working overtime, or mark a normal weekday as a non-work day if the
  site will be closed. Toggling a day recalculates the completion date automatically.

### 3. Construction Progress

1. Open the **Construction Progress** tab. It lists every category from Scope of Work that has
   a quantity greater than 0, showing its label and quantity.
2. For each item, set its **Status**:
   - **Pending** - 0% complete.
   - **Complete** - 100% complete.
   - **Partially Complete** - enter a custom percentage (0-100) in the field that appears.
3. The **Overall Progress** bar at the top automatically averages the percentage across all
   listed items.
4. Click **Save** to persist the changes.

### 4. Updates

1. Open the **Updates** tab.
2. Pick the **Date** for the update.
3. Type details into the large text box (notes, status, issues, etc.).
4. Optionally select one or more **Images** to attach (photos from the site).
5. Click **Post Update**. The new entry appears at the top of the feed below the form.
6. Each entry shows its date, text, and any attached images.
   - Click **🗑️ Delete** on an entry to remove the whole update (and its images).
   - Click the **✕** on an individual image to remove just that photo.

---

## Files Reference

### Backend (new)

- `model/ProjectScopeOfWork.java`, `ProjectScopeOfWorkDTO.java`
- `model/ProjectTimeline.java`, `ProjectTimelineDTO.java`
- `model/ProjectDelay.java`, `ProjectDelayDTO.java`
- `model/ProjectWorkDayOverride.java`, `ProjectWorkDayOverrideDTO.java`
- `model/ProjectProgressItem.java`, `ProjectProgressItemDTO.java`
- `model/ProjectUpdate.java`, `ProjectUpdateDTO.java`
- `model/ProjectUpdateImage.java`, `ProjectUpdateImageDTO.java`
- `model/ProjectDataDTO.java`
- `repository/IProjectScopeOfWorkRepository.java`, `IProjectTimelineRepository.java`,
  `IProjectDelayRepository.java`, `IProjectWorkDayOverrideRepository.java`,
  `IProjectProgressItemRepository.java`, `IProjectUpdateRepository.java`,
  `IProjectUpdateImageRepository.java`
- `service/IProjectManagementService.java`, `ProjectManagementService.java`
- `service/IProjectUpdateService.java`, `ProjectUpdateService.java`
- `controller/ProjectManagementController.java`, `ProjectUpdateController.java`
- `config/WebConfig.java`

### Backend (modified)

- `security/SecurityConfig.java` - added `/api/project-management/**` and
  `/api/project-updates/**` to the authenticated routes.
- `application.properties` - added `upload.dir`, `spring.servlet.multipart.max-file-size`,
  `spring.servlet.multipart.max-request-size`.

### Frontend (new)

- `src/components/projectManagement/ProjectManagement.jsx`
- `src/components/projectManagement/ProjectManagementDetail.jsx`
- `src/components/projectManagement/ScopeOfWork.jsx`
- `src/components/projectManagement/Timeline.jsx`
- `src/components/projectManagement/ProjectCalendar.jsx`
- `src/components/projectManagement/ConstructionProgress.jsx`
- `src/components/projectManagement/Updates.jsx`
- `src/utils/projectCategories.js`
- `src/utils/projectTimeline.js`
- `src/utils/projectManagementApi.js`

### Frontend (modified)

- `src/components/Layout.jsx` - added navbar link and side-nav layout match.
- `src/App.jsx` - added the two new routes.
- `vite.config.js` - added `/uploads` proxy.
