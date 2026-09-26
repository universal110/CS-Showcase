export const normalizeAnswer = (value: string): string => value
  .toUpperCase().replace(/[.,!?;:'"“”‘’]/g, '').trim().replace(/\s+/g, ' ');
export const answersMatch = (attempt: string, answer: string): boolean => normalizeAnswer(attempt) === normalizeAnswer(answer);
