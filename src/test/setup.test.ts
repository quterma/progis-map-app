import { describe, it, expect } from 'vitest';

describe('Test Setup', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have jest-dom matchers available', () => {
    const div = document.createElement('div');
    div.textContent = 'Hello';
    document.body.appendChild(div); // Добавляем элемент в DOM
    expect(div).toBeInTheDocument();

    // Очищаем после теста
    document.body.removeChild(div);
  });
});
