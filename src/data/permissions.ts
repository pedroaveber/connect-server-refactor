// permissions.ts

import z from "zod";

export const permissions = {
  companyGroup: {
    read: "companyGroup:read",
    update: "companyGroup:update",

    createPhoneNumber: "companyGroup:createPhoneNumber",
    deletePhoneNumber: "companyGroup:deletePhoneNumber",
    updatePhoneNumber: "companyGroup:updatePhoneNumber",
  },
  company: {
    create: "company:create",
    read: "company:read",
    update: "company:update",
    delete: "company:delete",

    createPhoneNumber: "company:createPhoneNumber",
    deletePhoneNumber: "company:deletePhoneNumber",
    updatePhoneNumber: "company:updatePhoneNumber",
  },
  unit: {
    create: "unit:create",
    read: "unit:read",
    update: "unit:update",
    delete: "unit:delete",

    createPhoneNumber: "unit:createPhoneNumber",
    deletePhoneNumber: "unit:deletePhoneNumber",
    updatePhoneNumber: "unit:updatePhoneNumber",
  },
  base: {
    create: "base:create",
    read: "base:read",
    update: "base:update",
    delete: "base:delete",

    createPhoneNumber: "base:createPhoneNumber",
    deletePhoneNumber: "base:deletePhoneNumber",
    updatePhoneNumber: "base:updatePhoneNumber",
  },
  user: {
    create: "user:create",
    read: "user:read",
    update: "user:update",
    delete: "user:delete",
    assignRole: "user:assignRole",
  },
  ambulance: {
    create: "ambulance:create",
    read: "ambulance:read",
    update: "ambulance:update",
    delete: "ambulance:delete",
    switchBase: "ambulance:switchBase",
    switchStatus: "ambulance:switchStatus",
  },
  ambulanceDocuments: {
    create: "ambulanceDocuments:create",
    update: "ambulanceDocuments:update",
    delete: "ambulanceDocuments:delete",
    bulkUpdate: "ambulanceDocuments:bulkUpdate",
  },
  sys_admin: {
    accessAll: "sys_admin:accessAll",
  },
} as const;

// 🔒 Tipo automático — gera um tipo union com todas as permissões ("company:create" | "user:read" | ...)
export type Permission = {
  [Module in keyof typeof permissions]: (typeof permissions)[Module][keyof (typeof permissions)[Module]];
}[keyof typeof permissions];

// ✅ Gera um array literal de todas as permissões
export const allPermissions = Object.values(permissions).flatMap(Object.values);

// ✅ Cria o schema Zod dinamicamente
export const PermissionSchema = z.enum(
  allPermissions as [Permission, ...Permission[]]
);
