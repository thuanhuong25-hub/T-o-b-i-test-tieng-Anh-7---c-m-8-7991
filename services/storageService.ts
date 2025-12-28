import { GeneratedTest, SavedTestRecord, TestConfig } from "../types";

const STORAGE_KEY = 'vn_edtech_saved_tests';

export const saveTest = (name: string, data: GeneratedTest, config: TestConfig): SavedTestRecord => {
  const existingJson = localStorage.getItem(STORAGE_KEY);
  let savedTests: SavedTestRecord[] = existingJson ? JSON.parse(existingJson) : [];

  const newRecord: SavedTestRecord = {
    id: crypto.randomUUID(),
    name,
    timestamp: Date.now(),
    data,
    config
  };

  // Add to beginning of array
  savedTests.unshift(newRecord);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTests));
  return newRecord;
};

export const getSavedTests = (): SavedTestRecord[] => {
  const existingJson = localStorage.getItem(STORAGE_KEY);
  return existingJson ? JSON.parse(existingJson) : [];
};

export const deleteTest = (id: string): SavedTestRecord[] => {
  const existingJson = localStorage.getItem(STORAGE_KEY);
  if (!existingJson) return [];

  let savedTests: SavedTestRecord[] = JSON.parse(existingJson);
  savedTests = savedTests.filter(t => t.id !== id);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTests));
  return savedTests;
};
