import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
} from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,

  schedule: [
    "create",
    "read",
    "update",
    "delete",
  ],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
  schedule: ["create", "read"],
});

export const moderator = ac.newRole({
  ...adminAc.statements,
  schedule: ["create", "read", "update", "delete"],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  schedule: ["create", "read", "update", "delete"],
});
