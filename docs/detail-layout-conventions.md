# Standard Detail Page Layout Convention

To maintain a consistent, modern, and high-quality aesthetic across the application, all entity detail pages (Organizations, Users, Tournaments, Teams, etc.) must follow this layout structure:

## Anatomy of a Detail Page

A detail page consists of 3 main structural areas:

1. **Navigation & Breadcrumbs (Top):**
   - Simple back button (e.g., `ArrowLeft`).
   - Standard `PageHeader` indicating the title and optionally the ID or status.

2. **Horizontal Hero Card (Top block):**
   - This replaces the old `grid-cols-3` split layout.
   - **Visuals:** Use a prominent horizontal surface. Apply styling such as a subtle background gradient (e.g. `bg-gradient-to-r from-accent-acid/5 to-bg-surface`) or elevated card style.
   - **Content:**
     - **Left/Center-Left:** Primary visual identifier (Logo, Avatar, Cover Image) rendered large (e.g., `w-24 h-24` or `w-20 h-20`).
     - **Center/Middle:** Core identity information (Title, Name, Short Name, Email, Region, Key Status Badges).
     - **Right:** Primary actions (Edit, Delete, Suspend). Using a flex-row layout with `justify-between` and `items-center` generally works best here.
   - **State Handling:** The Hero Card should remain visible and read-only even when the page enters `editMode`.

3. **Details & Edit Form (Bottom block):**
   - Rendered directly below the Hero Card as a standard full-width block or a `max-w-4xl` centered wrapper, depending on content density.
   - **View Mode:** Renders a list of `DetailRow` components displaying the remainder of the entity's data. Wait to use grids exclusively when there is too much data.
   - **Edit Mode:** The view mode is swapped out for the input form fields. The form inputs should use responsive grids (e.g. `grid-cols-1 md:grid-cols-2`) for better screen utilization. 
   - **Save Actions:** While placing Save/Cancel in the top hero is acceptable, an additional sticky `Save/Cancel` action bar at the bottom of the form is highly recommended for long forms.

## Design Goals
- **Wow Factor:** The hero section gives the user an immediate sense of scale and premium feel.
- **Scannability:** Users immediately see "Who/What this is" at the top before diving into the granular details below.
- **Responsiveness:** Ensure the horizontal hero card collapses gracefully into a stacked column (`flex-col sm:flex-row`) on mobile devices.
