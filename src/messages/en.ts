import type { Stage, WorkMode } from "@/jobs/job";

/** "1 day" or "3 days". */
function dayCount(days: number): string {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

/** A date relative to today: "today", "tomorrow", "in 3 days", "yesterday", "3 days ago". */
function relativeDay(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  return days > 0 ? `in ${dayCount(days)}` : `${dayCount(-days)} ago`;
}

/** When a next step is due: "due today", "due in 2 days", "overdue by 1 day". */
function dueText(days: number): string {
  if (days < 0) return `overdue by ${dayCount(-days)}`;
  return days === 0 ? "due today" : `due ${relativeDay(days)}`;
}

// All text the user can see lives in this file. To add another language,
// copy this object into a new file and translate the values.
export const en = {
  // Used to format dates, for example "24 Nov 2026".
  locale: "en-GB",
  app: {
    name: "Job Search Tracker",
    description:
      "Track your job applications in one place. Your data stays in your browser.",
  },
  stages: {
    saved: "Saved",
    applied: "Applied",
    interview: "Interview",
    offer: "Offer",
    closed: "Closed",
  } satisfies Record<Stage, string>,
  modes: {
    remote: "Remote",
    hybrid: "Hybrid",
    onsite: "On-site",
    "": "Not set",
  } satisfies Record<WorkMode, string>,
  jobs: {
    // Saved as the next step when a vacancy moves to Applied.
    followUpStep: "Follow up if there is no reply",
    untitled: "Untitled vacancy",
  },
  pipeline: {
    label: "Vacancies by stage. Choose a stage to show only its vacancies.",
  },
  summary: (open: number, appliedThisWeek: number) =>
    `${open} open ${open === 1 ? "vacancy" : "vacancies"} · ` +
    `${appliedThisWeek} ${appliedThisWeek === 1 ? "application" : "applications"} sent this week`,
  nextUp: {
    heading: "Next up",
    empty: "Nothing is due in the next 3 days.",
    stepDue: (step: string, days: number) =>
      `${step || "Next step"}: ${dueText(days)}`,
    deadlineSoon: (days: number) =>
      days === 0
        ? "Last day to apply is today"
        : `Last day to apply ${relativeDay(days)}`,
    deadlinePassed: (days: number) =>
      `The deadline passed ${relativeDay(days)}`,
    noReply: (days: number) => `No reply for ${dayCount(-days)}`,
    actions: {
      markApplied: "Mark applied",
      done: "Done",
      remindInAWeek: "Remind me in a week",
      close: "Close it",
    },
    actionLabel: (action: string, name: string) => `${action}: ${name}`,
  },
  list: {
    heading: "Your vacancies",
    add: "Add vacancy",
    loading: "Loading your vacancies…",
    emptyTitle: "No vacancies yet",
    emptyText:
      "Add the first job you want to apply for. Everything you add is saved in this browser only.",
    edit: (name: string) => `Edit ${name}`,
    stageLabel: (name: string) => `Stage of ${name}`,
    deadline: (date: string) => `Apply by ${date}`,
    appliedOn: (date: string) => `Applied ${date}`,
    nextOn: (date: string) => `on ${date}`,
    openLink: (name: string) => `Open the job posting for ${name}`,
    search: "Search",
    searchPlaceholder: "Title, company, location, source or notes",
    sort: "Sort by",
    sortOrders: {
      newest: "Newest first",
      soonest: "Soonest date",
      company: "Company A–Z",
    },
    stageFilter: "Stage",
    allStages: "All stages",
    showing: (shown: number, total: number) => `Showing ${shown} of ${total}`,
    clearFilters: "Clear search and filters",
    noMatches: "No vacancies match your search or filter.",
  },
  theme: {
    label: "Theme",
    system: "System",
    light: "Light",
    dark: "Dark",
  },
  skipToList: "Skip to your vacancies",
  data: {
    heading: "Your data",
    text: "Everything is saved in this browser only. Export a file to keep a backup or to move your vacancies to another browser.",
    export: "Export JSON",
    import: "Import JSON",
    confirmTitle: "Replace your vacancies?",
    confirmText: (fileCount: number, savedCount: number) =>
      `The file has ${fileCount} ${fileCount === 1 ? "vacancy" : "vacancies"}. ` +
      `Importing it replaces the ${savedCount} ${savedCount === 1 ? "vacancy" : "vacancies"} saved in this browser. ` +
      "Export first if you want to keep them.",
    confirmImport: "Replace and import",
    cancel: "Cancel",
    imported: (count: number) =>
      `Imported ${count} ${count === 1 ? "vacancy" : "vacancies"}.`,
    importFailed: (reason: string) =>
      `The file could not be imported. ${reason}`,
  },
  dialog: {
    addTitle: "Add a vacancy",
    editTitle: "Edit vacancy",
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    delete: "Delete",
    confirmDelete: "Delete this vacancy? This cannot be undone.",
    confirmDeleteYes: "Yes, delete",
    confirmDeleteNo: "Keep it",
    requiredHint: "A job title or a company is required.",
    fields: {
      title: "Job title",
      company: "Company",
      url: "Link to the job posting",
      location: "Location",
      mode: "Work mode",
      salary: "Salary",
      source: "Found on",
      status: "Stage",
      deadline: "Apply by",
      appliedOn: "Applied on",
      nextStep: "Next step",
      nextOn: "Next step date",
      notes: "Notes",
    },
    placeholders: {
      url: "https://",
      salary: "For example 3,000–3,500 EUR a month",
      source: "For example LinkedIn or a friend",
      nextStep: "For example Prepare for the call",
    },
  },
  validation: {
    titleOrCompany: "Enter a job title or a company.",
    link: "Enter a link that starts with http:// or https://.",
    date: "Enter a date as YYYY-MM-DD, or leave it empty.",
  },
  errors: {
    notJson: "This is not a JSON file.",
    unknownFormat: "This file was not made by Job Search Tracker.",
    newerVersion:
      "This data was saved by a newer version of the app. Reload the page to get the latest version.",
    badJob: (position: number, field: string, problem: string) =>
      `Vacancy ${position}, field "${field}": ${problem}`,
    duplicateIds: "Two vacancies in the file have the same id.",
    loadFailed: "Your vacancies could not be loaded.",
    saveFailed:
      "The change could not be saved. Your browser storage may be full or turned off.",
    dismiss: "Dismiss",
  },
};
