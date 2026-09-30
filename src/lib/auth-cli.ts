import { betterAuth } from "better-auth";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },

  user: {
    modelName: "User",

    additionalFields: {
      roleId: {
        type: "number",
        required: true,
        input: false,
        returned: true,
      },
    },
  },

  advanced: {
    database: {
      generateId: "serial",
    },
  },
});