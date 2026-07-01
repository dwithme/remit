import { prisma } from "./prisma";

const SETTINGS_ID = "main";

export const getSettings = async () => {
  const settings = await prisma.settings.findUnique({
    where: { id: SETTINGS_ID },
  });

  if (settings) return settings;

  return prisma.settings.create({
    data: {
      id: SETTINGS_ID,
    },
  });
};

