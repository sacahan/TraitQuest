import { useAuthStore } from "../stores/authStore";

export const updateUserFromQuest = (levelInfo: {
  level: number;
  exp: number;
  expToNextLevel?: number;
  classId?: string;
}) => {
  const updates: { level: number; exp: number; heroClassId?: string } = {
    level: levelInfo.level,
    exp: levelInfo.exp,
  };

  if (levelInfo.classId) {
    updates.heroClassId = levelInfo.classId;
  }

  useAuthStore.getState().updateUser(updates);
};

export const logoutAndRedirect = () => {
  useAuthStore.getState().logout();
  window.location.href = "/";
};
