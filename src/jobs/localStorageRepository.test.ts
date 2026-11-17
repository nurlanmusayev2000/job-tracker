import { beforeEach, describe, expect, it } from "vitest";

import { messages } from "@/messages";
import { createFakeStorage, makeJob, makeJobInput } from "@/test/factories";

import {
  createLocalStorageRepository,
  STORAGE_KEY,
} from "./localStorageRepository";
import { JobNotFoundError, type JobRepository } from "./repository";
import { CURRENT_VERSION, InvalidDataError } from "./storedData";

const NOW = new Date("2026-11-17T10:00:00.000Z");
const LATER = new Date("2026-11-18T12:30:00.000Z");

/** A repository on fake storage, with a clock and ids the test controls. */
function setUp(initial: Record<string, string> = {}) {
  const storage = createFakeStorage(initial);
  let time = NOW;
  let nextId = 1;
  const repository = createLocalStorageRepository({
    storage,
    now: () => time,
    createId: () => `id-${nextId++}`,
  });
  return {
    storage,
    repository,
    setTime: (value: Date) => {
      time = value;
    },
    saved: () => JSON.parse(storage.getItem(STORAGE_KEY) ?? "null"),
  };
}

describe("createLocalStorageRepository", () => {
  let repository: JobRepository;
  let ctx: ReturnType<typeof setUp>;

  beforeEach(() => {
    ctx = setUp();
    repository = ctx.repository;
  });

  it("lists nothing when nothing is saved", async () => {
    await expect(repository.list()).resolves.toEqual([]);
  });

  describe("create", () => {
    it("adds an id and timestamps and returns the job", async () => {
      const job = await repository.create(makeJobInput({ title: "Designer" }));

      expect(job).toEqual({
        ...makeJobInput({ title: "Designer" }),
        id: "id-1",
        createdAt: NOW.toISOString(),
        updatedAt: NOW.toISOString(),
      });
    });

    it("saves the job with the format version", async () => {
      const job = await repository.create(makeJobInput());

      expect(ctx.saved()).toEqual({ version: CURRENT_VERSION, jobs: [job] });
      await expect(repository.list()).resolves.toEqual([job]);
    });

    it("keeps jobs in the order they were added", async () => {
      await repository.create(makeJobInput({ title: "First" }));
      await repository.create(makeJobInput({ title: "Second" }));

      const titles = (await repository.list()).map((job) => job.title);
      expect(titles).toEqual(["First", "Second"]);
    });

    it("refuses an invalid job and saves nothing", async () => {
      const input = makeJobInput({ title: "", company: "" });

      await expect(repository.create(input)).rejects.toThrow(
        messages.validation.titleOrCompany,
      );
      expect(ctx.saved()).toBeNull();
    });
  });

  describe("update", () => {
    it("changes the given fields and the updated time", async () => {
      const job = await repository.create(makeJobInput());
      ctx.setTime(LATER);

      const updated = await repository.update(job.id, {
        status: "applied",
        notes: "Sent through the website",
      });

      expect(updated).toEqual({
        ...job,
        status: "applied",
        notes: "Sent through the website",
        updatedAt: LATER.toISOString(),
      });
      await expect(repository.list()).resolves.toEqual([updated]);
    });

    it("never changes the id or the created time", async () => {
      const job = await repository.create(makeJobInput());
      ctx.setTime(LATER);

      // TypeScript would not allow these fields, but plain JavaScript could
      // still send them, so the repository must ignore them.
      const changes = {
        id: "other",
        createdAt: LATER.toISOString(),
      } as unknown as Parameters<JobRepository["update"]>[1];
      const updated = await repository.update(job.id, changes);

      expect(updated.id).toBe(job.id);
      expect(updated.createdAt).toBe(job.createdAt);
    });

    it("throws for an unknown id", async () => {
      await expect(repository.update("missing", {})).rejects.toThrow(
        JobNotFoundError,
      );
    });

    it("refuses invalid changes and keeps the saved job", async () => {
      const job = await repository.create(makeJobInput());

      await expect(
        repository.update(job.id, { url: "not a link" }),
      ).rejects.toThrow(messages.validation.link);
      await expect(repository.list()).resolves.toEqual([job]);
    });
  });

  describe("remove", () => {
    it("deletes the job", async () => {
      const first = await repository.create(makeJobInput({ title: "First" }));
      const second = await repository.create(makeJobInput({ title: "Second" }));

      await repository.remove(first.id);

      await expect(repository.list()).resolves.toEqual([second]);
    });

    it("does nothing for an unknown id", async () => {
      const job = await repository.create(makeJobInput());
      await repository.remove("missing");
      await expect(repository.list()).resolves.toEqual([job]);
    });
  });

  describe("replaceAll", () => {
    it("replaces every saved job", async () => {
      await repository.create(makeJobInput({ title: "Old" }));
      const imported = [makeJob({ id: "a" }), makeJob({ id: "b" })];

      await repository.replaceAll(imported);

      await expect(repository.list()).resolves.toEqual(imported);
    });

    it("refuses invalid jobs and keeps the saved ones", async () => {
      const job = await repository.create(makeJobInput());

      await expect(
        repository.replaceAll([makeJob({ deadline: "soon" })]),
      ).rejects.toThrow(InvalidDataError);
      await expect(repository.list()).resolves.toEqual([job]);
    });
  });
});

describe("reading saved data", () => {
  it("updates data in an old format and saves the current format on the next change", async () => {
    const oldJob = makeJob({ id: "old" });
    const ctx = setUp({ [STORAGE_KEY]: JSON.stringify([oldJob]) });

    await expect(ctx.repository.list()).resolves.toEqual([oldJob]);

    await ctx.repository.update("old", { notes: "Updated" });
    expect(ctx.saved().version).toBe(CURRENT_VERSION);
  });

  it("reports text that is not JSON and leaves it untouched", async () => {
    const ctx = setUp({ [STORAGE_KEY]: "{not json" });

    await expect(ctx.repository.list()).rejects.toThrow(
      messages.errors.notJson,
    );
    await expect(ctx.repository.create(makeJobInput())).rejects.toThrow(
      InvalidDataError,
    );
    expect(ctx.storage.getItem(STORAGE_KEY)).toBe("{not json");
  });

  it("reports data from a newer version and leaves it untouched", async () => {
    const newer = JSON.stringify({ version: CURRENT_VERSION + 1, jobs: [] });
    const ctx = setUp({ [STORAGE_KEY]: newer });

    await expect(ctx.repository.list()).rejects.toThrow(
      messages.errors.newerVersion,
    );
    expect(ctx.storage.getItem(STORAGE_KEY)).toBe(newer);
  });
});
