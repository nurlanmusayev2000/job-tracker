// All text the user can see lives in this file. To add another language,
// copy this object into a new file and translate the values.
export const en = {
  app: {
    name: "Job Search Tracker",
    description:
      "Track your job applications in one place. Your data stays in your browser.",
  },
  home: {
    underConstruction:
      "The tracker is being built. This page will become the list of your vacancies.",
  },
  jobs: {
    // Saved as the next step when a vacancy moves to Applied.
    followUpStep: "Follow up if there is no reply",
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
  },
};
