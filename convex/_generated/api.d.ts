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
import type * as attendance from "../attendance.js";
import type * as communications from "../communications.js";
import type * as contractors from "../contractors.js";
import type * as equipment from "../equipment.js";
import type * as inventory from "../inventory.js";
import type * as projects from "../projects.js";
import type * as purchaseRequests from "../purchaseRequests.js";
import type * as storage from "../storage.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  attendance: typeof attendance;
  communications: typeof communications;
  contractors: typeof contractors;
  equipment: typeof equipment;
  inventory: typeof inventory;
  projects: typeof projects;
  purchaseRequests: typeof purchaseRequests;
  storage: typeof storage;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
