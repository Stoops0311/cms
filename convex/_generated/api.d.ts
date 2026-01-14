/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as ambulances from "../ambulances.js";
import type * as attendance from "../attendance.js";
import type * as budgetRevisions from "../budgetRevisions.js";
import type * as communications from "../communications.js";
import type * as contractors from "../contractors.js";
import type * as equipment from "../equipment.js";
import type * as fiberTeams from "../fiberTeams.js";
import type * as finance from "../finance.js";
import type * as hrDocuments from "../hrDocuments.js";
import type * as incidentReports from "../incidentReports.js";
import type * as inventory from "../inventory.js";
import type * as leaveRequests from "../leaveRequests.js";
import type * as procurementLogs from "../procurementLogs.js";
import type * as projectDocuments from "../projectDocuments.js";
import type * as projects from "../projects.js";
import type * as purchaseRequests from "../purchaseRequests.js";
import type * as qualityControl from "../qualityControl.js";
import type * as safety from "../safety.js";
import type * as shifts from "../shifts.js";
import type * as staffExitClearances from "../staffExitClearances.js";
import type * as storage from "../storage.js";
import type * as timesheets from "../timesheets.js";
import type * as trainingRequests from "../trainingRequests.js";
import type * as users from "../users.js";
import type * as vendorCompletions from "../vendorCompletions.js";
import type * as vendorPayments from "../vendorPayments.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  ambulances: typeof ambulances;
  attendance: typeof attendance;
  budgetRevisions: typeof budgetRevisions;
  communications: typeof communications;
  contractors: typeof contractors;
  equipment: typeof equipment;
  fiberTeams: typeof fiberTeams;
  finance: typeof finance;
  hrDocuments: typeof hrDocuments;
  incidentReports: typeof incidentReports;
  inventory: typeof inventory;
  leaveRequests: typeof leaveRequests;
  procurementLogs: typeof procurementLogs;
  projectDocuments: typeof projectDocuments;
  projects: typeof projects;
  purchaseRequests: typeof purchaseRequests;
  qualityControl: typeof qualityControl;
  safety: typeof safety;
  shifts: typeof shifts;
  staffExitClearances: typeof staffExitClearances;
  storage: typeof storage;
  timesheets: typeof timesheets;
  trainingRequests: typeof trainingRequests;
  users: typeof users;
  vendorCompletions: typeof vendorCompletions;
  vendorPayments: typeof vendorPayments;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
