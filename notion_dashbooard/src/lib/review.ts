import {
  pickStatusName,
  ReviewGrade,
  scheduleReview,
} from "./srs";

type Reviewable = {
  pageId: string;
  databaseId: string;
  statusProperty: string;
  statusType: "status" | "select";
  statusOptions: { name: string; color: string }[];
  nextReviewProperty: string;
  intervalDays: number;
  intervalProperty: string | null;
};

export function buildReviewGradePayload(
  item: Reviewable,
  grade: ReviewGrade,
) {
  const schedule = scheduleReview(item.intervalDays, grade);
  const status = pickStatusName(item.statusOptions, schedule.statusKind);

  const body: Record<string, unknown> = {
    databaseId: item.databaseId,
    status: {
      property: item.statusProperty,
      type: item.statusType,
      value: status,
    },
    date: {
      property: item.nextReviewProperty,
      value: schedule.nextReview,
    },
  };

  if (item.intervalProperty) {
    body.number = {
      property: item.intervalProperty,
      value: schedule.intervalDays,
    };
  }

  return {
    body,
    local: {
      status,
      nextReview: schedule.nextReview,
      intervalDays: schedule.intervalDays,
    },
    schedule,
  };
}
