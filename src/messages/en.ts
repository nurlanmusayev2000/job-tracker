import type { Stage, WorkMode } from "@/jobs/job";

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
    loadFailed: "Your vacancies could not be loaded.",
    saveFailed:
      "The change could not be saved. Your browser storage may be full or turned off.",
    dismiss: "Dismiss",
  },
};
